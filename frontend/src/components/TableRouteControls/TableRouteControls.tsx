import React from "react";
import PositionSetterBar from "../PositionSetterBar/PositionSetterBar";
import TableRouteActions from "../TableRouteActions/TableRouteActions";
import { PositionSetterBarAction, PositionSetterBarState } from "../TableRoute";
import { Member } from "../../utils/utils";

type Props = {
    setterBarState: PositionSetterBarState;
    selectedMember: Member | undefined;
    usedMembers: Member[];
    currentPositionIndex: number;
    hasAudioFiles: boolean;
    isGenerating: boolean;
    generationDisabled: boolean;
    handlePositionsSetterBarAction: (action: PositionSetterBarAction, args?: Member) => void;
    handleRouteSubmit: () => void;
    handleSetDebugRoute: () => void;
    handleRemoveDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragOver: (event: React.DragEvent<HTMLTableElement>) => void;
    openModal: (() => void) | undefined;
};

const TableRouteControls: React.FC<Props> = ({
    setterBarState,
    selectedMember,
    usedMembers,
    currentPositionIndex,
    hasAudioFiles,
    isGenerating,
    generationDisabled,
    handlePositionsSetterBarAction,
    handleRouteSubmit,
    handleSetDebugRoute,
    handleRemoveDrop,
    handleDragOver,
    openModal,
}) => {
    return (
        <div className="table-route-controls">
            <PositionSetterBar
                state={setterBarState}
                currentPositionIndex={currentPositionIndex}
                handlePositionsSetterBarAction={handlePositionsSetterBarAction}
                selectedMember={selectedMember}
                usedMembers={usedMembers}
                disabled={hasAudioFiles}
            />
            <TableRouteActions
                handleRouteSubmit={handleRouteSubmit}
                handleSetDebugRoute={handleSetDebugRoute}
                handleRemoveDrop={handleRemoveDrop}
                handleDragOver={handleDragOver}
                openModal={openModal}
                isGenerating={isGenerating}
                generationDisabled={generationDisabled}
            />
        </div>
    );
};

export default TableRouteControls;
