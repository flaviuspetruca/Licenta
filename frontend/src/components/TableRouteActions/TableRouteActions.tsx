import { FC } from "react";
import Spinner from "../UI/Spinner";

type TableRouteActionsProps = {
    handleRouteSubmit: () => void;
    handleSetDebugRoute: () => void;
    handleRemoveDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragOver: (event: React.DragEvent<HTMLTableElement>) => void;
    openModal: (() => void) | undefined;
    isGenerating: boolean;
    generationDisabled: boolean;
};

const TableRouteActions: FC<TableRouteActionsProps> = ({
    handleRouteSubmit,
    handleSetDebugRoute,
    handleRemoveDrop,
    handleDragOver,
    openModal,
    isGenerating,
    generationDisabled,
}) => (
    <div className="flex flex-wrap justify-end gap-2">
        <button className={`submit`} onClick={handleRouteSubmit} disabled={generationDisabled || isGenerating}>
            {isGenerating ? (
                <div className="flex content-center items-center flex-row gap-2">
                    <Spinner variant="text-white" />
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
            <img draggable={false} className="trash-img" src="trash.svg" alt="trash"></img>
        </div>
    </div>
);

export default TableRouteActions;
