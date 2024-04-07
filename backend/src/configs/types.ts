export type Hold = {
    image_format: string;
    difficulty: Difficulty;
    type: HoldType;
    size: Size;
};

export type HoldEntity = Hold & { hold_id: string };

export type Size = "S" | "M" | "L";

export type Difficulty = "Incepator" | "Intermediar" | "Avansat";

export type HoldType =
    | "Pinch"
    | "Sloper"
    | "Jug"
    | "Pocket"
    | "Edge"
    | "Crimp"
    | "Undercling"
    | "Gaston"
    | "Volume"
    | "Cubby";

export type MatrixElement = HoldEntity | undefined;
export type Matrix = MatrixElement[][];

export type Coordinates = {
    x: number;
    y: number;
};

export enum Member {
    LEFT_HAND = "left-hand",
    RIGHT_HAND = "right-hand",
    LEFT_FOOT = "left-foot",
    RIGHT_FOOT = "right-foot",
}

export type Position = {
    [Member.LEFT_HAND]: Coordinates;
    [Member.RIGHT_HAND]: Coordinates;
    [Member.LEFT_FOOT]: Coordinates;
    [Member.RIGHT_FOOT]: Coordinates;
};

export type MemberMoveInfo = {
    distance: undefined | string;
    direction: undefined | string;
    heightLevel: undefined | number;
    isDifferent: undefined | boolean;
};

export type ProcessedPosition = {
    [Member.LEFT_HAND]: MemberMoveInfo;
    [Member.RIGHT_HAND]: MemberMoveInfo;
    [Member.LEFT_FOOT]: MemberMoveInfo;
    [Member.RIGHT_FOOT]: MemberMoveInfo;
};

// LOGIC TYPES
export enum Distance {
    CLOSE = "close",
    FAR = "far",
}

export enum HeightLevel {
    LEGS = 30,
    THIGHS_KNEES = 60,
    HIPS = 90,
    UPPER_BODY = 120,
    HEAD = 150,
    OVERHEAD = 180,
    OUT_OF_REACH = 210,
}

export enum Direction {
    LEFT = "left",
    RIGHT = "right",
}

export enum ApplicationState {
    "DEV",
    "PROD",
}

import { Request as ExpressRequest } from "express";
export type Request = ExpressRequest & { id: string };
