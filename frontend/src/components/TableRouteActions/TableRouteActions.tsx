import { FC } from "react";
import Spinner from "../UI/Spinner";

type TableRouteActionsProps = {
    handleRouteSubmit: () => void;
    handleSetDebugRoute: () => void;
    handleRemoveDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragOver: (event: React.DragEvent<HTMLTableElement>) => void;
    openModal: (() => void) | undefined;
    isGenerating: boolean;
    save: boolean;
};

const TableRouteActions: FC<TableRouteActionsProps> = ({
    handleRouteSubmit,
    handleSetDebugRoute,
    handleRemoveDrop,
    handleDragOver,
    openModal,
    isGenerating,
    save,
}) => (
    <div className="flex justify-end gap-3">
        <button className={`submit`} onClick={handleRouteSubmit} disabled={!save}>
            {isGenerating ? (
                <div className="flex content-center items-center flex-row gap-2">
                    <Spinner />
                    <p>Processing...</p>
                </div>
            ) : (
                <p>Generate</p>
            )}
        </button>
        <button className="interactable-container text-red-500 font-bold" onClick={handleSetDebugRoute}>
            DEBUG
        </button>
        <div
            className="interactable-container flex justify-center"
            onDrop={handleRemoveDrop}
            onDragOver={handleDragOver}
            onClick={openModal}
            draggable={false}
        >
            <img draggable={false} src="trash.svg" alt="trash"></img>
        </div>
    </div>
);

export default TableRouteActions;
