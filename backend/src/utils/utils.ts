import { Member } from "../configs/types";

const getMember = (
    positionKey: "hands" | "feet",
    placementKey: "leftMember" | "rightMember"
): Member => {
    if (positionKey === "hands") {
        return placementKey === "leftMember"
            ? Member.LEFT_HAND
            : Member.RIGHT_HAND;
    } else {
        return placementKey === "leftMember"
            ? Member.LEFT_FOOT
            : Member.RIGHT_FOOT;
    }
};

export { getMember };
