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
    processing: boolean;
    generated: boolean;
    difficulty: string;
    routeName: string;
    handleRouteNameChange: (routeName: string) => void;
    handlePositionsSetterBarAction: (action: PositionSetterBarAction, args?: Member) => void;
    handleRouteSubmit: () => void;
    handleSetDebugRoute: () => void;
    handleRemoveDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragOver: (event: React.DragEvent<HTMLTableElement>) => void;
    handleDifficultyChange: (difficulty: string) => void;
    openModal: (() => void) | undefined;
};

const TableRouteControls: React.FC<Props> = ({
    setterBarState,
    selectedMember,
    usedMembers,
    currentPositionIndex,
    hasAudioFiles,
    processing,
    generated,
    routeName,
    difficulty,
    handleRouteNameChange,
    handlePositionsSetterBarAction,
    handleRouteSubmit,
    handleSetDebugRoute,
    handleRemoveDrop,
    handleDragOver,
    handleDifficultyChange,
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
                handleRouteNameChange={handleRouteNameChange}
                handleRouteSubmit={handleRouteSubmit}
                handleSetDebugRoute={handleSetDebugRoute}
                handleRemoveDrop={handleRemoveDrop}
                handleDragOver={handleDragOver}
                handleDifficultyChange={handleDifficultyChange}
                routeName={routeName}
                difficulty={difficulty}
                openModal={openModal}
                processing={processing}
                generated={generated}
            />
        </div>
    );
};

export default TableRouteControls;
