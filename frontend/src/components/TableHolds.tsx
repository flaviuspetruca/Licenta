import React, { useEffect, useMemo, useState } from "react";
import "./Table.scss";
import { Hold, HoldEntity } from "../types";
import { getHoldImageURL } from "../utils/utils";

type Props = {
    numRows: number;
    numCols: number;
    holds: Map<string, Hold>;
    startRouting: boolean;
    setStartRouting: React.Dispatch<React.SetStateAction<boolean>>;
    routeName: string;
    setRouteName: React.Dispatch<React.SetStateAction<string>>;
    transition: boolean;
};

const TableHolds = ({
    numRows,
    numCols,
    holds,
    startRouting,
    setStartRouting,
    routeName,
    setRouteName,
    transition,
}: Props) => {
    const [animation, setAnimation] = useState<string>("");
    const [height, setHeight] = useState<string>("auto");

    const matrix = useMemo(() => {
        const result = [];
        for (let i = 0; i < numRows; i++) {
            const row = [];
            for (let j = 0; j < numCols; j++) {
                const hold_id = `texture_${numRows * i + j}`;
                const hold = holds.get(hold_id);
                if (hold) {
                    const hold_image_format = `${hold?.image_format}`;
                    row.push(
                        <div
                            draggable={hold !== undefined && startRouting}
                            onDragStart={(e) =>
                                handleOnDrag(e, { ...hold, hold_id })
                            }
                        >
                            <img
                                draggable={hold !== undefined && startRouting}
                                className="hold-image"
                                src={getHoldImageURL(
                                    `${hold_id}.${hold_image_format}`
                                )}
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
    }, [numRows, numCols, holds, startRouting]);

    const handleOnDrag = (
        e: React.DragEvent<HTMLDivElement>,
        data: HoldEntity
    ) => {
        e.dataTransfer.clearData();
        e.dataTransfer.setData(
            "application/to-route-setting-panel",
            JSON.stringify({ ...data, component: "TableHolds" })
        );
    };

    const handleRouteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRouteName(e.target.value);
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
            <h2 className="table-h">Holds Panel</h2>
            <table className="table w-fit">
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
            <div className="flex flex-row justify-between">
                <button
                    className={`action-button-${startRouting ? "orange" : "blue"}`}
                    onClick={() => setStartRouting(!startRouting)}
                >
                    {startRouting ? "Cancel" : "Start Planning"}
                </button>
                <input
                    className="bg-gray-100 appearance-none border-2 border-black-200 rounded w-1/2 py-2 px-4 text-gray-700 leading-tight border-black focus:outline-none focus:bg-white focus:border-purple-900"
                    id="inline"
                    type="text"
                    placeholder="Route name"
                    value={routeName}
                    onChange={handleRouteNameChange}
                ></input>
            </div>
        </div>
    );
};

export default TableHolds;
