import React, { useCallback, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import "./Table.scss";
import { BACKEND_ENDPOINT } from "../configs";
import { Coordinates, HoldEntity, Matrix, MatrixElement, Position } from "../types";
import RouteSettingTable from "./RouteSettingTable/RouteSettingTable";
import { Member } from "../utils/utils";
import { buildHttpHeaders, fetchFn } from "../utils/http";
import debugRouteJson from "../assets/debug_route.json";
import TableRouteControls from "./TableRouteControls/TableRouteControls";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAlert, AlertType } from "./UI/AlertProvider";
import { AudioData } from "./MainPanel";
import { difficultyLevels } from "./TableRouteActions/TableRouteActions";
import { RouteTotalData } from "./Routes/Route";

export enum PositionSetterBarState {
    HIDDEN = "HIDDEN",
    OPEN = "OPEN",
    ALLOW_EDIT = "ALLOW_EDIT",
}

export enum PositionSetterBarAction {
    SET_POSITIONS = "setPositions",
    SET_SELECTED_MEMBER = "setSelectedMember",
    POSITION_SAVE = "positionSave",
    EDIT = "edit",
    PREVIOUS = "previous",
    NEXT = "next",
    RESET = "reset",
}

type Props = {
    openModal: (() => void) | undefined;
    numRows: number;
    numCols: number;
    audioData: AudioData | undefined;
    setAudioData: React.Dispatch<React.SetStateAction<AudioData | undefined>>;
    hasAudioFiles: boolean;
    routeHighlight: { positionIndex: number; member: Member } | undefined;
    setRouteHighlight: React.Dispatch<React.SetStateAction<{ positionIndex: number; member: Member } | undefined>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const TableRoute = forwardRef((props: Props, ref) => {
    const {
        openModal,
        numRows,
        numCols,
        audioData,
        setAudioData,
        hasAudioFiles,
        routeHighlight,
        setRouteHighlight,
        setLoading,
    }: Props = props;
    const { id } = useParams();
    const { showAlert } = useAlert();
    const params = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
    const [isSettingPositions, setIsSettingPositions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member>();
    const [positions, setPositions] = useState<Position[]>([]);
    const [processing, setProccessing] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [isRouteSaved, setIsRouteSaved] = useState(false);
    const [routeName, setRouteName] = useState<string>("");
    const [difficulty, setDifficulty] = useState<string>(difficultyLevels[0]);
    const [picture, setPicture] = useState<File | null>(null);

    const _emptyMatrix = useMemo(() => {
        const initialMatrix = [];
        for (let i = 0; i < numRows; i++) {
            const row = [];
            for (let j = 0; j < numCols; j++) {
                row.push(null);
            }
            initialMatrix.push(row);
        }
        return initialMatrix;
    }, [numCols, numRows]);

    const _notSetCoordinates = useMemo(() => {
        return { x: -1, y: -1 };
    }, []);

    const _emptyNewPosition: Position = useMemo(() => {
        return {
            "left-hand": _notSetCoordinates,
            "right-hand": _notSetCoordinates,
            "left-foot": _notSetCoordinates,
            "right-foot": _notSetCoordinates,
        };
    }, [_notSetCoordinates]);

    const [matrix, setMatrix] = useState<Matrix>(_emptyMatrix);
    const [currentPosition, setCurrentPosition] = useState<Position>(_emptyNewPosition);
    const [debugRoute, setDebugRoute] = useState<Boolean>(false);

    // Finds if there is a member in the current position at the given coordinates
    const _getMemberFromCurrentPositon = (coordinatesToFind: Coordinates) => {
        for (const [member, coordinates] of Object.entries(currentPosition)) {
            if (coordinates.x === coordinatesToFind.x && coordinates.y === coordinatesToFind.y) {
                return member as Member;
            }
        }
        return null;
    };

    const _getMembersWithSetCoordinates = (position: Position): Member[] => {
        return Object.entries(position)
            .filter(([, coordinates]) => coordinates.x !== -1 && coordinates.y !== -1)
            .map(([member]) => member as Member);
    };

    const usedMembers = useMemo(() => {
        return _getMembersWithSetCoordinates(currentPosition);
    }, [currentPosition]);

    const updateCurrentPosition = (member: Member, coordinates: Coordinates) => {
        setCurrentPosition((position) => ({
            ...position,
            [member]: coordinates,
        }));
    };

    const handleSetRetrievedPositions = (positions: Position[]) => {
        setPositions(positions);
        setCurrentPosition(positions[0]);
        setCurrentPositionIndex(0);
    };

    const handleOnClick = (e: React.MouseEvent<HTMLTableCellElement>) => {
        e.preventDefault();
        if (!isSettingPositions) return;

        const row = (e.currentTarget.parentElement as HTMLTableRowElement)?.rowIndex;
        const col = e.currentTarget.cellIndex;
        if (matrix[row][col] === undefined) return;

        // If no member is selected, remove the member from the current position
        if (selectedMember === undefined) {
            const memberToRemove = _getMemberFromCurrentPositon({ x: row, y: col });
            if (!memberToRemove) return;
            updateCurrentPosition(memberToRemove, _notSetCoordinates);
            return;
        }

        // If a member is selected, find if there is a member in the current position at the given coordinates
        const memberAtDesiredCell = _getMemberFromCurrentPositon({ x: row, y: col });
        // If there is a member in the current position at the given coordinates, remove it first
        if (memberAtDesiredCell) {
            updateCurrentPosition(memberAtDesiredCell, _notSetCoordinates);
        }

        // Set the selected member to the clicked position only if there is a hold in the clicked position
        if (matrix[row][col] === null) return;
        updateCurrentPosition(selectedMember, { x: row, y: col });

        // Reset the selected member
        setSelectedMember(undefined);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableElement>) => {
        e.preventDefault();
    };

    const handleOnDrop = (e: React.DragEvent<HTMLTableCellElement>) => {
        setIsSettingPositions(true);
        const data = e.dataTransfer.getData("application/to-route-setting-panel");
        if (data === "") return;
        const parsedData: HoldEntity = JSON.parse(data);
        if (!parsedData) e.preventDefault();

        const row = (e.currentTarget.parentElement as HTMLTableRowElement)?.rowIndex;
        const col = e.currentTarget.cellIndex;

        matrix[row][col] = parsedData;
        setMatrix([...matrix]);
    };

    // Remove the hold from the route either by dragging it to the trash area or by double clicking it
    const handleRemoveDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("application/from-route-setting-panel");
        if (data === "") return;
        const parsedJson: { rowIndex: number; colIndex: number } = JSON.parse(data);
        const rowIndex = parsedJson.rowIndex;
        const colIndex = parsedJson.colIndex;
        matrix[rowIndex][colIndex] = null;
        setMatrix([...matrix]);
    };

    const handleRemoveClick = (e: React.MouseEvent<HTMLTableCellElement>) => {
        e.preventDefault();
        if (isSettingPositions) return;
        const rowIndex = (e.currentTarget.parentElement as HTMLTableRowElement)?.rowIndex;
        const colIndex = e.currentTarget.cellIndex;

        // Update holds matrix
        matrix[rowIndex][colIndex] = null;
        setMatrix([...matrix]);
    };

    const handleActionSubmit = () => {
        generated ? handleRouteSave() : handleRouteSubmit();
    };

    // TODO: handle input
    const handleRouteSave = async () => {
        const body = new FormData();
        if (params[0].get("route_id")) {
            body.append("route_id", String(params[0].get("route_id"))); // possibly null when route is saved for the first time
        }
        body.append("routeName", routeName);
        body.append("dir_id", audioData?.path || "");
        body.append("difficulty", difficulty);
        body.append("file", picture as File, picture?.name);
        const response = await fetchFn(`${BACKEND_ENDPOINT}/save-route/${id}`, buildHttpHeaders("POST", body, ""));
        if (response.ok) {
            showAlert({ title: "Success", description: "Route saved successfully", type: AlertType.SUCCESS });
            setIsRouteSaved(true);
            const data = await response.json();
            navigate(`/route-creator/${id}?route_id=${data.id}`);
        } else {
            showAlert({ title: "Error", description: "Failed to save route", type: AlertType.ERROR });
        }
    };

    const handleRouteSubmit = async () => {
        const body = JSON.stringify({
            positions,
            matrix,
        });

        setProccessing(true);
        const response = await fetchFn(`${BACKEND_ENDPOINT}/route/${id}`, buildHttpHeaders("POST", body));
        setProccessing(false);
        if (response.ok) {
            const data = await response.formData();
            const jsonData: AudioData = JSON.parse(data.get("json_data") as string);

            if (!jsonData) {
                showAlert({ title: "Error", description: "Failed to generate route. No data", type: AlertType.ERROR });
                return;
            }

            const blobs = data.getAll("audio_blob") as File[];
            jsonData.blobs = blobs;
            setAudioData({ ...jsonData });
            setGenerated(true);
        } else {
            showAlert({ title: "Error", description: "Failed to generate route", type: AlertType.ERROR });
            setAudioData(undefined);
        }
    };

    const handleRouteNameChange = (routeName: string) => {
        setRouteName(routeName);
    };

    const handleSetPositions = () => {
        setIsSettingPositions(true);
    };

    const handleSavePositions = () => {
        if (usedMembers.length !== 4) {
            showAlert({ title: "Error", description: "All members must be set", type: AlertType.ERROR });
            return;
        }

        if (currentPositionIndex < positions.length) {
            positions[currentPositionIndex] = currentPosition;
            setCurrentPosition(positions[currentPositionIndex]);
        } else {
            positions.push(currentPosition);
            setCurrentPosition(_emptyNewPosition);
        }

        setSelectedMember(undefined);
        setPositions([...positions]);
        setCurrentPositionIndex(currentPositionIndex + 1);
    };

    const handleSetDebugRoute = () => {
        if (!debugRoute) {
            const matrix = debugRouteJson.matrix;
            const positions = debugRouteJson.positions;
            setMatrix(matrix as MatrixElement[][]);
            setPositions(positions as Position[]);
            setDebugRoute(false);
        }
    };

    const handleSetSelectedMember = (member: Member) => {
        setSelectedMember(member);
    };

    const handleNext = () => {
        setSelectedMember(undefined);
        if (currentPositionIndex < positions.length - 1) {
            setCurrentPosition(positions[currentPositionIndex + 1]);
        } else if (currentPositionIndex === positions.length - 1) {
            setCurrentPosition(_emptyNewPosition);
        } else return;

        setCurrentPositionIndex(currentPositionIndex + 1);
    };

    const handlePrevious = () => {
        setSelectedMember(undefined);
        if (currentPositionIndex > 0) {
            setCurrentPosition(positions[currentPositionIndex - 1]);
            setCurrentPositionIndex(currentPositionIndex - 1);
        }
    };

    const allowSetPositions = (positions: Position[], currentPositionIndex: number) => {
        if (currentPositionIndex < positions.length) return true;
        return false;
    };

    const handleDifficultyChange = (difficulty: string) => {
        setDifficulty(difficulty);
    };

    const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            if (files[0].size > 1048576) {
                showAlert({ title: "Error", description: "File size must be less than 1MB", type: AlertType.ERROR });
                e.target.value = "";
                return;
            }
            if (files[0].type.split("/")[0] !== "image") {
                showAlert({ title: "Error", description: "File must be an image", type: AlertType.ERROR });
                e.target.value = "";
                return;
            }
            setPicture(files[0]);
        }
    };

    const handlePositionsSetterBarAction = (action: PositionSetterBarAction, args: any) => {
        switch (action) {
            case PositionSetterBarAction.RESET:
                resetSettingPositions();
                break;
            case PositionSetterBarAction.SET_POSITIONS:
                handleSetPositions();
                break;
            case PositionSetterBarAction.PREVIOUS:
                handlePrevious();
                break;
            case PositionSetterBarAction.NEXT:
                handleNext();
                break;
            case PositionSetterBarAction.POSITION_SAVE:
                handleSavePositions();
                break;
            case PositionSetterBarAction.SET_SELECTED_MEMBER:
                handleSetSelectedMember(args);
                break;
            case PositionSetterBarAction.EDIT:
                handleEdit();
                break;
            default:
                break;
        }
    };

    const setterBarState = useMemo(() => {
        let state = PositionSetterBarState.HIDDEN;

        if (isSettingPositions || isEditing) {
            state = PositionSetterBarState.OPEN;
        }
        if (generated) {
            state = PositionSetterBarState.ALLOW_EDIT;
        }
        return state;
    }, [isSettingPositions, isEditing, generated]);

    const handleEdit = useCallback(() => {
        setIsSettingPositions(true);
        setAudioData(undefined);
        setRouteHighlight(undefined);
        setIsEditing(true);
        setGenerated(false);
        setIsRouteSaved(false);
    }, [setAudioData, setRouteHighlight]);

    const previousPosition = useMemo(() => {
        if (currentPositionIndex === 0) {
            return undefined;
        }
        return positions[currentPositionIndex - 1];
    }, [currentPositionIndex, positions]);

    const resetCurrentPosition = useCallback(() => {
        setCurrentPositionIndex(0);
        setCurrentPosition(_emptyNewPosition);
    }, [_emptyNewPosition]);

    const resetSettingPositions = useCallback(() => {
        setRouteHighlight(undefined);
        setPositions([]);
        resetCurrentPosition();
        setSelectedMember(undefined);
    }, [resetCurrentPosition, setRouteHighlight]);

    const resetPanel = useCallback(() => {
        resetSettingPositions();
        setAudioData(undefined);
        setMatrix([..._emptyMatrix]);
        setIsSettingPositions(false);
        setGenerated(false);
    }, [_emptyMatrix, resetSettingPositions, setAudioData]);

    useImperativeHandle(ref, () => ({
        resetPanel,
        setMatrix,
        handleSetRetrievedPositions,
        setRouteName,
        setDifficulty,
        handleEdit,
    }));

    useEffect(() => {
        if (routeHighlight && hasAudioFiles && allowSetPositions(positions, routeHighlight.positionIndex)) {
            setCurrentPosition(positions[routeHighlight.positionIndex]);
            setCurrentPositionIndex(routeHighlight.positionIndex);
        }
    }, [routeHighlight, currentPositionIndex, positions, hasAudioFiles]);

    useEffect(() => {
        setIsEditing(false);
    }, [generated]);

    useEffect(() => {
        async function getRoute() {
            const queryParams = new URLSearchParams(location.search);
            const route_id = queryParams.get("route_id");

            if (!route_id) return;
            const response = await fetchFn(`${BACKEND_ENDPOINT}/route/${route_id}`, buildHttpHeaders());

            if (!response.ok) return;

            const data = await response.formData();
            const routeData: RouteTotalData = JSON.parse(data.get("json_data") as string);
            const blobs = data.getAll("audio_blob") as File[];
            if (!routeData.data || !routeData.path || !blobs.length) {
                showAlert({ title: "Error", description: "Failed to retrive route", type: AlertType.ERROR });
                return;
            }
            handleEdit();
            setMatrix([...routeData.matrix]);
            handleSetRetrievedPositions([...routeData.positions]);
            setRouteName(routeData.route.name);
            setDifficulty(routeData.route.difficulty);
            setLoading(false);
        }

        getRoute();
    }, [showAlert, location, setLoading]);

    return (
        <div className="table-container rounded-4xl bg-route-setting-table">
            <h3 className="table-h">Route Setting Table</h3>
            <RouteSettingTable
                previousPosition={previousPosition}
                currentPosition={currentPosition}
                highlightedMember={routeHighlight?.member}
                matrix={matrix}
                handleDragOver={handleDragOver}
                handleOnDrop={handleOnDrop}
                handleRemoveClick={handleRemoveClick}
                handleOnClick={handleOnClick}
            ></RouteSettingTable>
            <TableRouteControls
                setterBarState={setterBarState}
                selectedMember={selectedMember}
                usedMembers={usedMembers}
                currentPositionIndex={currentPositionIndex}
                hasAudioFiles={hasAudioFiles}
                processing={processing}
                difficulty={difficulty}
                routeName={routeName}
                openModal={openModal}
                generated={generated}
                isRouteSaved={isRouteSaved}
                handlePositionsSetterBarAction={handlePositionsSetterBarAction}
                handleRouteSubmit={handleActionSubmit}
                handleSetDebugRoute={handleSetDebugRoute}
                handleRemoveDrop={handleRemoveDrop}
                handleDragOver={handleDragOver}
                handleRouteNameChange={handleRouteNameChange}
                handleDifficultyChange={handleDifficultyChange}
                handlePictureChange={handlePictureChange}
            />
        </div>
    );
});

export default TableRoute;
