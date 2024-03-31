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

export type Placement = {
    leftMember: Coordinates;
    rightMember: Coordinates;
};

export type Position = {
    hands: Placement;
    feet: Placement;
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

export enum Member {
    LEFT_HAND = "left-hand",
    RIGHT_HAND = "right-hand",
    LEFT_FOOT = "left-foot",
    RIGHT_FOOT = "right-foot",
}

export type MemberLabel =
    | "left-hand"
    | "right-hand"
    | "left-foot"
    | "right-foot";

export enum ApplicationState {
    "DEV",
    "PROD",
}

import { Request as ExpressRequest } from "express";
export type Request = ExpressRequest & { id: string };
