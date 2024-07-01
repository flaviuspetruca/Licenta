import React, { useEffect, useMemo, useState } from "react";
import "./Table.scss";
import { Hold, HoldEntity } from "../types";
import { getHoldImageURL } from "../utils/utils";

type Props = {
    numRows: number;
    numCols: number;
    holds: Hold[];
    transition: boolean;
};

const TableHolds = ({ numRows, numCols, holds, transition }: Props) => {
    const [animation, setAnimation] = useState<string>("");
    const [height, setHeight] = useState<string>("auto");

    const matrix = useMemo(() => {
        const result = [];
        for (let i = 0; i < numRows; i++) {
            const row = [];
            for (let j = 0; j < numCols; j++) {
                const hold_id = `texture_${numCols * i + j}`;
                const hold = holds.find((hold) => hold.image_name === hold_id);
                if (hold) {
                    const hold_image_format = `${hold?.image_format}`;
                    row.push(
                        <div draggable={hold !== undefined} onDragStart={(e) => handleOnDrag(e, { ...hold, hold_id })}>
                            <img
                                draggable={hold !== undefined}
                                className="hold-image"
                                src={getHoldImageURL(`${hold_id}.${hold_image_format}`)}
                                alt={`hold_${numRows * i + j}`}
                            />
                        </div>
                    );
                } else {
                    row.push(<div className="hold-placeholder"></div>);
                }
            }
            result.push(row);
        }
        return result;
    }, [numRows, numCols, holds]);

    const handleOnDrag = (e: React.DragEvent<HTMLDivElement>, data: HoldEntity) => {
        e.dataTransfer.clearData();
        e.dataTransfer.setData(
            "application/to-route-setting-panel",
            JSON.stringify({ ...data, component: "TableHolds" })
        );
    };

    useEffect(() => {
        if (transition) {
            setAnimation("");
        } else {
            setAnimation("rounded-b-xl");
            setHeight("auto");
        }
        setTimeout(() => {
            if (transition) {
                setAnimation("");
                setHeight("100%");
            }
        }, 0);
    }, [transition]);

    // Render the table
    return (
        <div
            className={`table-container rounded-t-xl bg-indigo-500 ${animation}`}
            style={{
                height: height,
                transition: "height 0.3s ease-in-out",
            }}
        >
            <h3 className="table-h">Holds Panel</h3>
            <div className="table-wrapper">
                <table className="table-holds">
                    <tbody>
                        {matrix.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td key={colIndex} className="td bg-white">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableHolds;
