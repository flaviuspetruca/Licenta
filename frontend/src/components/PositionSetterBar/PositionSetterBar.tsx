import HoldOption from "./HoldOption";
import { Member } from "../../utils/utils";
import { PositionSetterBarAction, PositionSetterBarState } from "../TableRoute";

type Props = {
    state: PositionSetterBarState;
    currentPositionIndex: number;
    handlePositionsSetterBarAction: (action: PositionSetterBarAction, args?: any) => void;
    selectedMember: Member | undefined;
    usedMembers: Member[];
    disabled: boolean;
};

const PositionSetterBar = ({
    state,
    currentPositionIndex,
    handlePositionsSetterBarAction,
    selectedMember,
    usedMembers,
}: Props) => {
    return state === PositionSetterBarState.HIDDEN ? (
        <div></div>
    ) : (
        <div className="flex h-fit flex-row bg-slate-200 rounded-lg p-3 gap-5">
            {state === PositionSetterBarState.ALLOW_EDIT && (
                <button
                    className="action-button-blue"
                    onClick={() => handlePositionsSetterBarAction(PositionSetterBarAction.EDIT)}
                >
                    Edit
                </button>
            )}
            {state === PositionSetterBarState.OPEN && (
                <div className="flex flex-col">
                    <div className="flex flex-row gap-2">
                        <button
                            className="action-button-orange"
                            onClick={() => handlePositionsSetterBarAction(PositionSetterBarAction.RESET)}
                        >
                            Reset
                        </button>
                        <button
                            className="action-button-dark-blue"
                            onClick={() => handlePositionsSetterBarAction(PositionSetterBarAction.PREVIOUS)}
                        >
                            Previous
                        </button>
                        <button
                            className="action-button-blue"
                            onClick={() => handlePositionsSetterBarAction(PositionSetterBarAction.POSITION_SAVE)}
                            disabled={usedMembers.length !== 4}
                        >
                            Save position {currentPositionIndex + 1}
                        </button>
                        <button
                            className="action-button-dark-blue"
                            onClick={() => handlePositionsSetterBarAction(PositionSetterBarAction.NEXT)}
                        >
                            Next
                        </button>
                    </div>
                    <div className="flex flex-row mx:auto gap-3 mt-5">
                        {Object.values(Member).map((member) => (
                            <HoldOption
                                key={member}
                                selectedMember={selectedMember}
                                setSelectedMember={() =>
                                    handlePositionsSetterBarAction(PositionSetterBarAction.SET_SELECTED_MEMBER, member)
                                }
                                member={member}
                                isUsed={usedMembers.includes(member)}
                            ></HoldOption>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PositionSetterBar;
