import React, { useCallback, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import "./Table.scss";
import { BACKEND_ENDPOINT } from "../configs";
import { Coordinates, HoldEntity, Matrix, MatrixElement, Position } from "../types";
import RouteSettingTable from "./RouteSettingTable/RouteSettingTable";
import { Member } from "../utils/utils";
import { buildHttpHeaders, fetchFn } from "../utils/http";
import debugRouteJson from "../assets/debug_route.json";
import TableRouteControls from "./TableRouteControls/TableRouteControls";
import { useParams, useSearchParams } from "react-router-dom";
import { useAlert, AlertType } from "./UI/AlertProvider";
import { AudioData } from "./MainPanel";
import { difficultyLevels } from "./TableRouteActions/TableRouteActions";

export enum PositionSetterBarState {
    HIDDEN = "HIDDEN",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    ALLOW_EDIT = "ALLOW_EDIT",
}

export enum PositionSetterBarAction {
    SET_POSITIONS = "setPositions",
    POSITION_SAVE = "positionSave",
    EDIT = "edit",
    PREVIOUS = "previous",
    NEXT = "next",
    CLOSE = "close",
    SET_SELECTED_MEMBER = "setSelectedMember",
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
    }: Props = props;
    const { id } = useParams();
    const { showAlert } = useAlert();
    const params = useSearchParams();
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
    const [isSettingPositions, setIsSettingPositions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member>();
    const [positions, setPositions] = useState<Position[]>([]);
    const [processing, setProccessing] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [routeName, setRouteName] = useState<string>("");
    const [difficulty, setDifficulty] = useState<string>(difficultyLevels[0]);

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

    // Function to update the current position
    const updateCurrentPosition = (member: Member, coordinates: Coordinates) => {
        setCurrentPosition((position) => ({
            ...position,
            [member]: coordinates,
        }));
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

        console.log(e);
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

    const handleRouteSave = async () => {
        const body = JSON.stringify({
            route_id: Number(params[0].get("route_id")),
            routeName,
            dir_id: audioData?.path,
            difficulty,
        });
        const response = await fetchFn(`${BACKEND_ENDPOINT}/save-route/${id}`, buildHttpHeaders("POST", body));
        if (response.ok) {
            showAlert({ title: "Success", description: "Route saved successfully", type: AlertType.SUCCESS });
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
        if (response.ok) {
            setProccessing(false);
            const data = await response.formData();
            const jsonData: AudioData = JSON.parse(data.get("json_data") as string);

            if (!jsonData) {
                showAlert({ title: "Error", description: "Failed to generate route. No data", type: AlertType.ERROR });
                return;
            }

            const blobs = data.getAll("audio_blob") as File[];
            jsonData.blobs = blobs;
            setAudioData({ ...jsonData });
            setIsEditing(false);
            setGenerated(true);
        } else {
            showAlert({ title: "Error", description: "Failed to generate route", type: AlertType.ERROR });
            setProccessing(false);
            setAudioData(undefined);
        }
    };

    const handleRouteNameChange = (routeName: string) => {
        setRouteName(routeName);
    };

    const handleSetPositions = () => {
        setIsSettingPositions(true);
    };

    const handleClose = () => {};

    const handleSavePositions = () => {
        if (usedMembers.length !== 4) {
            showAlert({ title: "Error", description: "All members must be set", type: AlertType.ERROR });
            return;
        }

        if (currentPositionIndex < positions.length) {
            // replacing the current position
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

    const handleEdit = useCallback(() => {
        setIsSettingPositions(true);
        setAudioData(undefined);
        setRouteHighlight(undefined);
        setIsEditing(!isEditing);
    }, [setAudioData, setRouteHighlight]);

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

    const handlePositionsSetterBarAction = (action: PositionSetterBarAction, args: any) => {
        switch (action) {
            case PositionSetterBarAction.CLOSE:
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

        if (hasAudioFiles && !isSettingPositions && !isEditing) {
            state = PositionSetterBarState.ALLOW_EDIT;
        }
        return state;
    }, [isSettingPositions, isEditing, hasAudioFiles]);

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
        setAudioData(undefined);
        setPositions([]);
        resetCurrentPosition();
        setIsSettingPositions(false);
        setSelectedMember(undefined);
        setGenerated(false);
    }, [resetCurrentPosition, setAudioData, setRouteHighlight]);

    const resetPanel = useCallback(() => {
        resetSettingPositions();
        setMatrix([..._emptyMatrix]);
    }, [_emptyMatrix, resetSettingPositions]);

    useImperativeHandle(ref, () => ({
        resetPanel,
        setMatrix,
        setPositions,
        setRouteName,
        setDifficulty,
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
        if (params[0].get("route_id")) {
            //handleEdit();
        }
    }, [params, handleEdit]);

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
                handlePositionsSetterBarAction={handlePositionsSetterBarAction}
                handleRouteSubmit={handleActionSubmit}
                handleSetDebugRoute={handleSetDebugRoute}
                handleRemoveDrop={handleRemoveDrop}
                handleDragOver={handleDragOver}
                handleRouteNameChange={handleRouteNameChange}
                handleDifficultyChange={handleDifficultyChange}
            />
        </div>
    );
});

export default TableRoute;
