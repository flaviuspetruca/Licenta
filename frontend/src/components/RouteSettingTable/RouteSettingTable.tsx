import React, { useCallback, useMemo } from "react";
import { Matrix, Position } from "../../types";
import RouteSettingTableCell from "./RouteSettingTableCell";
import { Member } from "../../utils/utils";

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
    // Returns the cell coordinates in the table and other data about based on a Position object,
    // which includes multiple coordinates of different members
    const getCells = useCallback((position: Position | undefined, isHighlighted: boolean = false) => {
        let cells: any[] = [];
        if (position === undefined) return cells;
        for (const [member, coordinates] of Object.entries(position)) {
            if (coordinates.x !== -1 && coordinates.y !== -1) {
                cells.push({
                    x: coordinates.x,
                    y: coordinates.y,
                    member: member,
                });
            }
        }
        return cells;
    }, []);

    const currentPositionCells = useMemo(() => getCells(currentPosition, true), [getCells, currentPosition]);
    const previousPositionCells = useMemo(() => getCells(previousPosition), [getCells, previousPosition]);

    return (
        <table className="table border-y-yellow-300" onDragOver={handleDragOver}>
            <tbody>
                {matrix.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, colIndex) => {
                            const currentPositionCell = currentPositionCells.find(
                                (currentPositionCell) =>
                                    currentPositionCell.x === rowIndex && currentPositionCell.y === colIndex
                            );

                            const previousPositionCell = previousPositionCells.find(
                                (previousPositionCell) =>
                                    previousPositionCell.x === rowIndex && previousPositionCell.y === colIndex
                            );

                            const isHighlighted = highlightedMember
                                ? highlightedMember === currentPositionCell?.member
                                : false;

                            return (
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
                                            selectedMember={currentPositionCell?.member}
                                            highlightedCell={isHighlighted}
                                            previousPositionCell={previousPositionCell?.member}
                                            holdId={cell.hold_id}
                                            imageFormat={cell.image_format}
                                        />
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default RouteSettingTable;
