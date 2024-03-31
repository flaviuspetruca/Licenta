import { useMemo } from "react";
import { Member, getHoldImageURL } from "../../utils/utils";

type Props = {
    rowIndex: number;
    colIndex: number;
    selectedMember: Member | undefined;
    previousPositionCell: Member | undefined;
    highlightedCell: boolean;
    holdId: string;
    imageFormat: string;
};

const RouteSettingTableCell = ({
    rowIndex,
    colIndex,
    selectedMember,
    highlightedCell,
    previousPositionCell,
    holdId,
    imageFormat,
}: Props) => {
    const handleOnDrag = (
        e: React.DragEvent<HTMLDivElement>,
        data: { rowIndex: number; colIndex: number }
    ) => {
        e.dataTransfer.clearData();
        e.dataTransfer.setData(
            "application/from-route-setting-panel",
            JSON.stringify({ ...data })
        );
    };

    const className = useMemo(() => {
        return `relative 
            ${highlightedCell ? "highlighted " : ""} 
            ${selectedMember ? "selected-hold " : ""} 
            ${
                previousPositionCell
                    ? `${selectedMember ? "selected-hold-previous-position-cell " : ""} 
                ${!selectedMember && !highlightedCell ? "previous-position-cell " : ""}`
                    : ""
            }`;
    }, [highlightedCell, selectedMember, previousPositionCell]);

    return (
        <div
            draggable
            onDragStart={(e) =>
                handleOnDrag(e, {
                    rowIndex,
                    colIndex,
                })
            }
            className={className}
        >
            {(selectedMember || previousPositionCell) && (
                <img
                    draggable={false}
                    src={`outputs/${selectedMember || previousPositionCell}.png`}
                    alt={selectedMember || previousPositionCell}
                    className="selected-hold-member-image"
                ></img>
            )}
            <img
                src={getHoldImageURL(`${holdId}.${imageFormat}`)}
                alt={`${rowIndex}_${colIndex}`}
                className={`hold-image ${selectedMember || previousPositionCell ? "pt-4 pr-4" : ""}`}
            />
        </div>
    );
};

export default RouteSettingTableCell;
