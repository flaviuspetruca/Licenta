import React, { useCallback, useMemo } from "react";
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
    const getCells = useCallback(
        (position: Position | undefined, isHighlighted: boolean = false) => {
            let cells: any[] = [];
            if (position === undefined) return cells;

            for (let [keyPos, placement] of Object.entries(position)) {
                for (let [keyPlace, memberCoords] of Object.entries(placement)) {
                    if (memberCoords.x !== -1 && memberCoords.y !== -1) {
                        const member = getMember(keyPos as keyof Position, keyPlace as keyof Placement);
                        cells.push({
                            x: memberCoords.x,
                            y: memberCoords.y,
                            member: member,
                            highlighted: isHighlighted && highlightedMember === member,
                        });
                    }
                }
            }
            return cells;
        },
        [highlightedMember]
    );

    const selectedCells = useMemo(() => getCells(currentPosition, true), [getCells, currentPosition]);
    const previousPositionCells = useMemo(() => getCells(previousPosition), [getCells, previousPosition]);

    return (
        <table className="table border-y-yellow-300" onDragOver={handleDragOver}>
            <tbody>
                {matrix.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, colIndex) => {
                            const selectedCell = selectedCells.find(
                                (selectedCell) => selectedCell.x === rowIndex && selectedCell.y === colIndex
                            );
                            const previousPositionCell = previousPositionCells.find(
                                (previousPositionCell) =>
                                    previousPositionCell.x === rowIndex && previousPositionCell.y === colIndex
                            );

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
                                            selectedMember={selectedCell?.member}
                                            highlightedCell={selectedCell?.highlighed || false}
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
