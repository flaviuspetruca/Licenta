import { MemberLabel } from "./types";

export const PORT = 3001;
export const AUDIO_BACKEND = "http://localhost:8443";

export const HOLDS_PATH = "src/configs/holds.json";
export const HOLDS_DESCRIPTIONS_PATH = "src/configs/holds_descriptions.json";
export const IMAGE_HOLDS_PATH = "assets/holds";
export const AUDIO_PATH = "assets/audio";
export const NEXT_POSITION_AUDIO = "next_position.mp3";
export const END_AUDIO = "end_of_track.mp3";

export const MEMBER_MAP = new Map<MemberLabel, [string, string]>([
    ["left-hand", ["hands", "leftMember"]],
    ["right-hand", ["hands", "rightMember"]],
    ["left-foot", ["feet", "leftMember"]],
    ["right-foot", ["feet", "rightMember"]],
]);

export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};
