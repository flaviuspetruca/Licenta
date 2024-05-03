import { useEffect, useState } from "react";
import { Member } from "../../utils/utils";

type Props = {
    selectedMember: Member | undefined;
    setSelectedMember: React.Dispatch<React.SetStateAction<Member | undefined>>;
    member: Member | undefined;
    isUsed: boolean;
};

const HoldOption = ({ selectedMember, setSelectedMember, member, isUsed }: Props) => {
    const [selectedCSSClass, setSelectedCSSClass] = useState("");

    const handleSelectedMember = () => {
        if (selectedMember === member) {
            setSelectedMember(undefined);
        } else {
            setSelectedMember(member);
        }
    };

    useEffect(() => {
        if (member === selectedMember) {
            setSelectedCSSClass("selected-hold");
        } else {
            setSelectedCSSClass("");
        }
    }, [member, selectedMember]);

    return (
        <button
            className={`interactable-container !border-slate-950 !border-3 ${selectedCSSClass} ${isUsed ? "used" : ""}`}
            onClick={handleSelectedMember}
            disabled={isUsed}
        >
            <img draggable={false} src={`/outputs/${member}.png`} alt={member} className="hold-image"></img>
        </button>
    );
};

export default HoldOption;
