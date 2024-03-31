import { BACKEND_ENDPOINT } from "../configs";

export enum Member {
    LEFT_HAND = "left-hand",
    RIGHT_HAND = "right-hand",
    LEFT_FOOT = "left-foot",
    RIGHT_FOOT = "right-foot",
}

const getHoldImageURL = (hold_id: string) => {
    return `${BACKEND_ENDPOINT}/holds-images/${hold_id}`;
};

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

export { getHoldImageURL, getMember };
