declare module "*.png";

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

export type Position = {
    "left-hand": Coordinates;
    "right-hand": Coordinates;
    "left-foot": Coordinates;
    "right-foot": Coordinates;
};
