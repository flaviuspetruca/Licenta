import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Table.scss";
import Modal from "react-modal";
import {
    Coordinates,
    HoldEntity,
    Matrix,
    MatrixElement,
    Placement,
    Position,
} from "../types";
import { BACKEND_ENDPOINT } from "../configs";
import RouteSettingTable from "./RouteSettingTable/RouteSettingTable";
import PositionSetterBar, {
    PositionSetterBarState,
} from "./PositionSetterBar/PositionSetterBar";
import { Member } from "../utils/utils";
import Spinner from "./UI/Spinner";
import debugRouteJson from "../assets/debug_route.json";

// TO DO: FIND WAY TO IMPORT FROM TYPES: DUPLICATED IN POSITON SETTERBAR
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

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
    },
};

Modal.setAppElement("#root");

type Props = {
    numRows: number;
    numCols: number;
    startRouting: boolean;
    routeName: string;
    setAudioFiles: React.Dispatch<
        React.SetStateAction<{ audio: string; member: string }[][]>
    >;
    hasAudioFiles: boolean;
    routeHighlight: { positionIndex: number; member: Member } | undefined;
};

type MemberLabel = "left-hand" | "right-hand" | "left-foot" | "right-foot";

// TODO: MOVE POSITION LOGIC INTO POSITION CLASS
const TableRoute = ({
    numRows,
    numCols,
    startRouting,
    routeName,
    setAudioFiles,
    hasAudioFiles,
    routeHighlight,
}: Props) => {
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [isSettingPositions, setIsSettingPositions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member>();
    const [positions, setPositions] = useState<Position[]>([]);
    const [generate, setGenerate] = useState(false);

    const [save, setSave] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const resetPanel = () => {
        setMatrix(_initiateMatrix());
        closeModal();
    };

    const _initiateMatrix = useCallback(() => {
        const initialMatrix = [];
        for (let i = 0; i < numRows; i++) {
            const row = [];
            for (let j = 0; j < numCols; j++) {
                row.push(undefined);
            }
            initialMatrix.push(row);
        }
        return initialMatrix;
    }, [numCols, numRows]);

    const _initiateNewPosition = useCallback(() => {
        return {
            hands: {
                leftMember: { x: -1, y: -1 },
                rightMember: { x: -1, y: -1 },
            },
            feet: {
                leftMember: { x: -1, y: -1 },
                rightMember: { x: -1, y: -1 },
            },
        };
    }, []);

    const memberMap = new Map<MemberLabel, [string, string]>([
        ["left-hand", ["hands", "leftMember"]],
        ["right-hand", ["hands", "rightMember"]],
        ["left-foot", ["feet", "leftMember"]],
        ["right-foot", ["feet", "rightMember"]],
    ]);

    const [matrix, setMatrix] = useState<Matrix>(_initiateMatrix());
    const [currentPosition, setCurrentPosition] = useState<Position>(
        _initiateNewPosition()
    );
    const [debugRoute, setDebugRoute] = useState<Boolean>(false);

    const isValidPosition = (selectedMember: Member, position: Position) => {
        const keys = memberMap.get(selectedMember);
        if (!keys) {
            return null;
        }

        const [part, member] = keys;
        return (
            position[part as keyof Position][member as keyof Placement].x ===
                -1 &&
            position[part as keyof Position][member as keyof Placement].y === -1
        );
    };

    const _metadataMember = (selectedMember: MemberLabel) => {
        const keys = memberMap.get(selectedMember);
        if (!keys) {
            return null;
        }
        return keys;
    };

    const _getMemberFromCurrentPositon = (coordinates: Coordinates) => {
        for (const part in currentPosition) {
            for (const member in currentPosition[part as keyof Position]) {
                const placement =
                    currentPosition[part as keyof Position][
                        member as keyof Placement
                    ];
                if (
                    placement.x === coordinates.x &&
                    placement.y === coordinates.y
                ) {
                    return [part, member];
                }
            }
        }
        return null;
    };

    const handleOnClick = (e: React.MouseEvent<HTMLTableCellElement>) => {
        e.preventDefault();
        if (!isSettingPositions) return;

        const row = (e.currentTarget.parentElement as HTMLTableRowElement)
            ?.rowIndex;
        const col = e.currentTarget.cellIndex;
        if (matrix[row][col] === undefined) return;

        const updatedCurrentPosition = { ...currentPosition };

        if (selectedMember === undefined) {
            const toBeRemoved = _getMemberFromCurrentPositon({
                x: row,
                y: col,
            });
            if (!toBeRemoved) return;
            updatedCurrentPosition[toBeRemoved[0] as keyof Position][
                toBeRemoved[1] as keyof Placement
            ] = {
                x: -1,
                y: -1,
            };
            setCurrentPosition(updatedCurrentPosition);
            return;
        }

        const metadata = _metadataMember(selectedMember);
        if (!metadata) return;
        const [part, member] = metadata;

        // check if there already was set an action for the new position of the selected member
        if (isValidPosition(selectedMember, currentPosition)) {
            updatedCurrentPosition[part as keyof Position][
                member as keyof Placement
            ] = {
                x: row,
                y: col,
            };
        } else {
            updatedCurrentPosition[part as keyof Position][
                member as keyof Placement
            ] = {
                x: -1,
                y: -1,
            };
        }
        setCurrentPosition(updatedCurrentPosition);
        setSelectedMember(undefined);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableElement>) => {
        e.preventDefault();
    };

    const handleOnDrop = (e: React.DragEvent<HTMLTableCellElement>) => {
        const data = e.dataTransfer.getData(
            "application/to-route-setting-panel"
        );
        if (data === "") return;
        const parsedData: HoldEntity = JSON.parse(data);
        if (!parsedData) e.preventDefault();

        const row = (e.currentTarget.parentElement as HTMLTableRowElement)
            ?.rowIndex;
        const col = e.currentTarget.cellIndex;

        matrix[row][col] = parsedData;
        setMatrix([...matrix]);
    };

    // Remove the hold from the route either by dragging it to the trash area or by double clicking it
    const handleRemoveDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData(
            "application/from-route-setting-panel"
        );
        if (data === "") return;
        const parsedJson: { rowIndex: number; colIndex: number } =
            JSON.parse(data);
        const rowIndex = parsedJson.rowIndex;
        const colIndex = parsedJson.colIndex;
        matrix[rowIndex][colIndex] = undefined;
        setMatrix([...matrix]);
    };

    const handleRemoveClick = (e: React.MouseEvent<HTMLTableCellElement>) => {
        e.preventDefault();
        if (isSettingPositions) return;
        const rowIndex = (e.currentTarget.parentElement as HTMLTableRowElement)
            ?.rowIndex;
        const colIndex = e.currentTarget.cellIndex;

        // Update holds matrix
        matrix[rowIndex][colIndex] = undefined;
        setMatrix([...matrix]);
    };

    const handleRouteSubmit = async () => {
        const body = JSON.stringify({
            routeName,
            matrix,
            positions,
        });
        setGenerate(true);
        const response = await fetch(`${BACKEND_ENDPOINT}/route`, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body,
        });
        if (response.ok) {
            setGenerate(false);
            const data = await response.json();
            // dispaly download audio button
            // added to history routes
            setAudioFiles(data);
            setIsSettingPositions(false);
            setIsEditing(false);
        } else {
            setGenerate(false);
            setAudioFiles([]);
            console.log("Error submitting the route" + response.status);
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
        if (getPositionMembers(currentPosition).length < 4) {
            // throw error. we need all positions to select all 4
            return;
        }
        setSelectedMember(undefined);
        setPositions([...positions, currentPosition]);
        setCurrentPosition(_initiateNewPosition());
        setCurrentPositionIndex(currentPositionIndex + 1);
    };

    const handleSetDebugRoute = () => {
        if (!debugRoute) {
            const matrix = debugRouteJson.matrix;
            // replace all occurences of "null" with "undefined"
            const newMatrix = matrix.map((row) =>
                row.map((el) => (el === null ? undefined : el))
            );
            const positions = debugRouteJson.positions;
            setPositions(positions as Position[]);
            setMatrix(newMatrix as MatrixElement[][]);
            setDebugRoute(false);
        }
    };

    const handleSetSelectedMember = (member: Member) => {
        setSelectedMember(member);
        setSave(false);
    };

    const handleSave = () => {
        setSave(!save);
        setSelectedMember(undefined);
    };

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleNext = () => {
        setSelectedMember(undefined);
        if (currentPositionIndex < positions.length - 1) {
            setCurrentPosition(positions[currentPositionIndex + 1]);
        } else if (currentPositionIndex === positions.length - 1) {
            setCurrentPosition(_initiateNewPosition());
        } else return;

        setCurrentPositionIndex(currentPositionIndex + 1);
    };

    const handlePrevious = () => {
        setSelectedMember(undefined);
        if (currentPositionIndex > 0) {
            setCurrentPositionIndex(currentPositionIndex - 1);
            setCurrentPosition(positions[currentPositionIndex - 1]);
        }
    };

    const handlePositionsSetterBarAction = (
        action: PositionSetterBarAction,
        args: any
    ) => {
        switch (action) {
            case PositionSetterBarAction.SAVE:
                handleSave();
                break;
            case PositionSetterBarAction.CANCEL:
                resetIsSettingPositions();
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
        console.log(startRouting, isSettingPositions, isEditing, hasAudioFiles);
        if (startRouting) {
            state = PositionSetterBarState.CLOSED;
        }

        if (isSettingPositions || isEditing) {
            state = PositionSetterBarState.OPEN;
        }

        if (hasAudioFiles && !isSettingPositions && !isEditing) {
            state = PositionSetterBarState.ALLOW_EDIT;
        }
        console.log(state);
        return state;
    }, [startRouting, isSettingPositions, isEditing, hasAudioFiles]);

    // TODO: refactor or remove
    const getPositionMembers = (position: Position) => {
        const members: Member[] = [];
        const leftHand = position.hands.leftMember;
        const rightHand = position.hands.rightMember;
        const leftFoot = position.feet.leftMember;
        const rightFoot = position.feet.rightMember;
        if (leftHand.x !== -1 && leftHand.y !== -1) {
            members.push("left-hand" as Member);
        }
        if (rightHand.x !== -1 && rightHand.y !== -1) {
            members.push("right-hand" as Member);
        }
        if (leftFoot.x !== -1 && leftFoot.y !== -1) {
            members.push("left-foot" as Member);
        }
        if (rightFoot.x !== -1 && rightFoot.y !== -1) {
            members.push("right-foot" as Member);
        }
        return members;
    };

    const previousPosition = useMemo(() => {
        if (currentPositionIndex === 0) {
            return undefined;
        }
        return positions[currentPositionIndex - 1];
    }, [currentPositionIndex, positions]);

    const resetIsSettingPositions = useCallback(() => {
        setSave(false);
        setPositions([]);
        setCurrentPositionIndex(0);
        setCurrentPosition(_initiateNewPosition());
        setIsSettingPositions(false);
        setSelectedMember(undefined);
    }, [_initiateNewPosition]);

    const resetMatrix = useCallback(() => {
        setMatrix(_initiateMatrix());
    }, [_initiateMatrix]);

    useEffect(() => {
        if (startRouting === false) {
            resetIsSettingPositions();
            resetMatrix();
        }
    }, [startRouting, resetIsSettingPositions, resetMatrix]);

    useEffect(() => {
        if (routeHighlight && hasAudioFiles) {
            setCurrentPosition(positions[routeHighlight.positionIndex]);
            setCurrentPositionIndex(routeHighlight.positionIndex);
        }
    }, [routeHighlight, currentPositionIndex, positions, hasAudioFiles]);

    // Render the table
    return (
        <div className="table-container rounded-4xl bg-cyan-800">
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Confirm reset route"
            >
                <h2 className="text-4xl font-bold mb-10">
                    Esti sigur ca vrei sa resetezi panoul?
                </h2>
                <div className="flex justify-end gap-5">
                    <button className="reset-btn" onClick={resetPanel}>
                        Reset
                    </button>
                    <button className="cancel-btn" onClick={closeModal}>
                        Cancel
                    </button>
                </div>
            </Modal>

            <h2 className="table-h">Route Setting Table</h2>
            <RouteSettingTable
                currentPosition={currentPosition}
                previousPosition={previousPosition}
                highlightedMember={routeHighlight?.member}
                matrix={matrix}
                handleDragOver={handleDragOver}
                handleOnDrop={handleOnDrop}
                handleRemoveClick={handleRemoveClick}
                handleOnClick={handleOnClick}
            ></RouteSettingTable>
            <div className="flex flex-row justify-between">
                <PositionSetterBar
                    state={setterBarState}
                    currentPositionIndex={currentPositionIndex}
                    handlePositionsSetterBarAction={
                        handlePositionsSetterBarAction
                    }
                    selectedMember={selectedMember}
                    usedMembers={getPositionMembers(currentPosition)}
                    disabled={hasAudioFiles}
                ></PositionSetterBar>
                <div className="flex justify-end gap-3">
                    <button
                        className={`submit`}
                        onClick={handleRouteSubmit}
                        disabled={!save}
                    >
                        {generate ? (
                            <div className="flex content-center items-center flex-row gap-2">
                                <Spinner />
                                <p>Processing...</p>
                            </div>
                        ) : (
                            <p>Generate</p>
                        )}
                    </button>
                    <button
                        className="interactable-container text-red-500 font-bold"
                        onClick={handleSetDebugRoute}
                    >
                        DEBUG
                    </button>
                    <div
                        className="interactable-container flex justify-center"
                        onDrop={handleRemoveDrop}
                        onDragOver={handleDragOver}
                        onClick={openModal}
                        draggable={false}
                    >
                        <img
                            draggable={false}
                            src="trash.svg"
                            alt="trash"
                        ></img>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableRoute;
