import React, { useCallback, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import "./Table.scss";
import { BACKEND_ENDPOINT } from "../configs";
import { Coordinates, HoldEntity, Matrix, MatrixElement, Position } from "../types";
import RouteSettingTable from "./RouteSettingTable/RouteSettingTable";
import { Member } from "../utils/utils";
import { fetchFn } from "../utils/http";
import debugRouteJson from "../assets/debug_route.json";
import TableRouteControls from "./TableRouteControls/TableRouteControls";
import { useParams } from "react-router-dom";
import { useAlert, AlertType } from "./UI/AlertProvider";

export enum PositionSetterBarState {
    HIDDEN = "HIDDEN",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    ALLOW_EDIT = "ALLOW_EDIT",
}

export enum PositionSetterBarAction {
    SET_POSITIONS = "setPositions",
    POSITION_SAVE = "positionSave",
    SAVE = "save",
    EDIT = "edit",
    PREVIOUS = "previous",
    NEXT = "next",
    CANCEL = "cancel",
    SET_SELECTED_MEMBER = "setSelectedMember",
}

type Props = {
    openModal: (() => void) | undefined;
    numRows: number;
    numCols: number;
    startRouting: boolean;
    routeName: string;
    setAudioFiles: React.Dispatch<React.SetStateAction<{ audio: string; member: string }[][]>>;
    hasAudioFiles: boolean;
    routeHighlight: { positionIndex: number; member: Member } | undefined;
    setRouteHighlight: React.Dispatch<React.SetStateAction<{ positionIndex: number; member: Member } | undefined>>;
};

const TableRoute = forwardRef((props: Props, ref) => {
    const {
        openModal,
        numRows,
        numCols,
        startRouting,
        routeName,
        setAudioFiles,
        hasAudioFiles,
        routeHighlight,
        setRouteHighlight,
    }: Props = props;
    const { id } = useParams();
    const { showAlert } = useAlert();
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
    const [isSettingPositions, setIsSettingPositions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member>();
    const [positions, setPositions] = useState<Position[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

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

        // Set the selected member to the clicked position
        updateCurrentPosition(selectedMember, { x: row, y: col });

        // Reset the selected member
        setSelectedMember(undefined);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableElement>) => {
        e.preventDefault();
    };

    const handleOnDrop = (e: React.DragEvent<HTMLTableCellElement>) => {
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

    const handleRouteSubmit = async () => {
        const body = JSON.stringify({
            routeName,
            positions,
            matrix,
        });
        setIsGenerating(true);
        const response = await fetchFn(`${BACKEND_ENDPOINT}/route/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body,
        });
        if (response.ok) {
            setIsGenerating(false);
            const data = await response.json();
            setAudioFiles(data);
            setIsSettingPositions(false);
            setIsEditing(false);
        } else {
            showAlert({ title: "Error", description: "Failed to generate route", type: AlertType.ERROR });
            setIsGenerating(false);
            setAudioFiles([]);
        }
    };

    const handleSetPositions = () => {
        if (startRouting) {
            setIsSettingPositions(true);
        } else {
            setIsSettingPositions(false);
        }
    };

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

    const handleEdit = () => {
        setIsSettingPositions(true);
        setAudioFiles([]);
        setRouteHighlight(undefined);
        setIsEditing(!isEditing);
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

    const handlePositionsSetterBarAction = (action: PositionSetterBarAction, args: any) => {
        switch (action) {
            case PositionSetterBarAction.CANCEL:
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
        if (startRouting) {
            state = PositionSetterBarState.CLOSED;
        }

        if (isSettingPositions || isEditing) {
            state = PositionSetterBarState.OPEN;
        }

        if (hasAudioFiles && !isSettingPositions && !isEditing) {
            state = PositionSetterBarState.ALLOW_EDIT;
        }
        return state;
    }, [startRouting, isSettingPositions, isEditing, hasAudioFiles]);

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
        setAudioFiles([]);
        setIsEditing(false);
        setPositions([]);
        resetCurrentPosition();
        setIsSettingPositions(false);
        setSelectedMember(undefined);
    }, [resetCurrentPosition, setAudioFiles, setRouteHighlight]);

    const resetPanel = useCallback(() => {
        resetSettingPositions();
        setMatrix(_emptyMatrix);
    }, [_emptyMatrix, resetSettingPositions]);

    useImperativeHandle(ref, () => ({
        resetPanel,
    }));

    useEffect(() => {
        if (startRouting === false) {
            resetPanel();
        }
    }, [startRouting, resetPanel]);

    useEffect(() => {
        if (routeHighlight && hasAudioFiles) {
            setCurrentPosition(positions[routeHighlight.positionIndex]);
            setCurrentPositionIndex(routeHighlight.positionIndex);
        }
    }, [routeHighlight, currentPositionIndex, positions, hasAudioFiles]);

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
                isGenerating={isGenerating}
                handlePositionsSetterBarAction={handlePositionsSetterBarAction}
                handleRouteSubmit={handleRouteSubmit}
                handleSetDebugRoute={handleSetDebugRoute}
                handleRemoveDrop={handleRemoveDrop}
                handleDragOver={handleDragOver}
                openModal={openModal}
                generationDisabled={positions.length === 0}
            />
        </div>
    );
});

export default TableRoute;
