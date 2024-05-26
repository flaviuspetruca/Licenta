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

const getDifficultyClass = (difficulty: string) => {
    const colorMap: { [key: string]: string } = {
        "1": "text-green-500",
        "2": "text-blue-500",
        "3": "text-yellow-500",
        "4": "text-orange-500",
        "5": "text-red-500",
    };

    const colorClass = colorMap[difficulty[0]];

    return colorClass || "text-gray-500";
};

export { getHoldImageURL, getDifficultyClass };
