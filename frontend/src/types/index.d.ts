declare module "*.png";

export type Hold = {
    image_name: string;
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

export type MatrixElement = HoldEntity | null;
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

export type UserTypeDB = {
    id: number;
    username: string;
    email: string;
    password: string;
    role: string;
    firstname: string;
    surname: string;
};

export type GymTypeDB = {
    id: number;
    location: string;
    name: string;
};

export type RouteTypeDB = { id: number; user_id: number; dir_id: string; gym_id: number; name: string };
