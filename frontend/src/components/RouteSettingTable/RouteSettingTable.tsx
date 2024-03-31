import React, { useMemo } from "react";
import { Matrix, Placement, Position } from "../../types";
import RouteSettingTableCell from "./RouteSettingTableCell";
import { Member, getMember } from "../../utils/utils";

type Props = {
    matrix: Matrix;
    currentPosition: Position;
    previousPosition: Position | undefined;
    highlightedMember: Member | undefined;
    handleDragOver: (e: React.DragEvent<HTMLTableElement>) => void;
    handleOnDrop: (e: React.DragEvent<HTMLTableCellElement>) => void;
    handleRemoveClick: (e: React.MouseEvent<HTMLTableCellElement>) => void;
    handleOnClick: (e: React.MouseEvent<HTMLTableCellElement>) => void;
};

const RouteSettingTable = ({
    matrix,
    currentPosition,
    previousPosition,
    highlightedMember,
    handleDragOver,
    handleOnDrop,
    handleRemoveClick,
    handleOnClick,
}: Props) => {
    const selectedCells = useMemo(() => {
        // returns the coordinates of the selected cells
        // selected cells are the members in currentPosition which have coordinates different from -1
        // also returns the highlighted member(this state happens on audio listening)
        let selectedCells = [];
        for (let [keyPos, placement] of Object.entries(currentPosition)) {
            for (let [keyPlace, memberCoords] of Object.entries(placement))
                if (memberCoords.x !== -1 && memberCoords.y !== -1) {
                    const member = getMember(
                        keyPos as keyof Position,
                        keyPlace as keyof Placement
                    );
                    selectedCells.push({
                        x: memberCoords.x,
                        y: memberCoords.y,
                        member: member,
                        highlighed: highlightedMember === member,
                    });
                }
        }
        return selectedCells;
    }, [currentPosition, highlightedMember]);

    const previousPositionCells = useMemo(() => {
        let previousPositionCells: any[] = [];
        if (previousPosition === undefined) return previousPositionCells;
        for (let [keyPos, placement] of Object.entries(previousPosition)) {
            for (let [keyPlace, memberCoords] of Object.entries(placement))
                if (memberCoords.x !== -1 && memberCoords.y !== -1) {
                    const member = getMember(
                        keyPos as keyof Position,
                        keyPlace as keyof Placement
                    );
                    previousPositionCells.push({
                        x: memberCoords.x,
                        y: memberCoords.y,
                        member: member,
                    });
                }
        }
        console.log(previousPositionCells);
        return previousPositionCells;
    }, [previousPosition]);

    return (
        <>
            <table
                className="table border-y-yellow-300"
                onDragOver={handleDragOver}
            >
                <tbody>
                    {matrix.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                                <td
                                    key={colIndex}
                                    className="td bg-white"
                                    onDrop={handleOnDrop}
                                    onDoubleClick={handleRemoveClick}
                                    onClick={handleOnClick}
                                >
                                    {cell === undefined ? (
                                        cell
                                    ) : (
                                        <RouteSettingTableCell
                                            rowIndex={rowIndex}
                                            colIndex={colIndex}
                                            selectedMember={
                                                selectedCells.find(
                                                    (selectedCell) =>
                                                        selectedCell.x ===
                                                            rowIndex &&
                                                        selectedCell.y ===
                                                            colIndex
                                                )?.member
                                            }
                                            highlightedCell={
                                                selectedCells.find(
                                                    (selectedCell) =>
                                                        selectedCell.x ===
                                                            rowIndex &&
                                                        selectedCell.y ===
                                                            colIndex
                                                )?.highlighed || false
                                            }
                                            previousPositionCell={
                                                previousPositionCells.find(
                                                    (previousPositionCell) =>
                                                        previousPositionCell.x ===
                                                            rowIndex &&
                                                        previousPositionCell.y ===
                                                            colIndex
                                                )?.member
                                            }
                                            holdId={cell.hold_id}
                                            imageFormat={cell.image_format}
                                        ></RouteSettingTableCell>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default RouteSettingTable;
