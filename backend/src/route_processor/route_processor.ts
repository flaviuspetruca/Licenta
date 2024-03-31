import { Coordinates, Matrix, Position } from "../configs/types";
import RouteComputer from "./compute";
import { TextGenerator } from "./text_generator";

type MemberType = "hands" | "feet";
type SideType = "leftMember" | "rightMember";

// TODO: MOVE THIS TO   CONFIGS
export const CELL_EDGE_SIZE = 30; // DISTANCE BETWEEN CENTERS OF TWO CELLS
export const CLOSE_LIMIT_DISTANCE = Math.sqrt(2 * Math.pow(CELL_EDGE_SIZE, 2));
export const FAR_LIMIT_DISTANCE = Math.sqrt(
    Math.pow(2 * CELL_EDGE_SIZE, 2) + Math.pow(CELL_EDGE_SIZE, 2)
);
export const MEMBERS: Array<[MemberType, SideType]> = [
    ["hands", "leftMember"],
    ["hands", "rightMember"],
    ["feet", "leftMember"],
    ["feet", "rightMember"],
];

type RouteProcessorProps = {
    request_id: string;
    matrix: Matrix;
    positions: Position[];
};

class RouteProcessor {
    request_id: string;
    matrix: Matrix;
    positions: Position[];
    routeComputer: RouteComputer;
    results: any[];
    textGenerator: TextGenerator;

    constructor({ request_id, matrix, positions }: RouteProcessorProps) {
        this.request_id = request_id;
        this.matrix = matrix;
        this.positions = positions;
        this.routeComputer = new RouteComputer(this.positions[0]);
        this.results = [];
    }

    async processRoute() {
        // Handling first move where there is no current position
        let comparison = this.comparePlacements(this.positions[0], null);
        this.results.push(comparison);
        for (let i = 0; i < this.positions.length - 1; i++) {
            comparison = this.comparePlacements(
                this.positions[i + 1],
                this.positions[i]
            );
            this.results.push(comparison);
        }
        this.textGenerator = new TextGenerator(this.request_id, this.results);
        return await this.textGenerator.generateText();
    }

    hasDifferentCoordinates(member1: Coordinates, member2: Coordinates) {
        if (member1.x === member2.x && member1.y === member2.y) {
            return false;
        } else {
            return true;
        }
    }

    processCoordinates(
        destinationCoordinates: Coordinates,
        sourceCoordinates: Coordinates
    ) {
        const distance = this.routeComputer.computeDistance(
            destinationCoordinates,
            sourceCoordinates
        );
        if (!distance) {
            // throw error
        }
        const direction = this.routeComputer.computeDirection(
            destinationCoordinates,
            sourceCoordinates
        );
        return {
            distance,
            direction,
        };
    }

    comparePlacements(
        destinationPosition: Position,
        sourcePosition?: Position
    ) {
        const result = {
            hands: {
                leftMember: null,
                rightMember: null,
            },
            feet: {
                leftMember: null,
                rightMember: null,
            },
        };

        const heightLevels = this.routeComputer.computeHeightLevels(
            destinationPosition,
            sourcePosition
        );

        // TODO: IMPROVEMENT REMOVE THE USE OF THIS FOR LOOP
        // IT IS USED ALSO IN COMPUTE.ts

        for (const [part, member] of MEMBERS) {
            const destinationCoordinates = destinationPosition[part][member];
            const sourceCoordinates = sourcePosition
                ? sourcePosition[part][member]
                : this.routeComputer.startingPosition[part][member];

            const isDifferent = this.hasDifferentCoordinates(
                destinationCoordinates,
                sourceCoordinates
            );
            result[part][member] = this.processCoordinates(
                destinationPosition[part][member],
                sourcePosition
                    ? sourcePosition[part][member]
                    : this.routeComputer.startingPosition[part][member]
            );
            result[part][member].heightLevel = heightLevels[part][member];
            result[part][member].isDifferent = isDifferent;
        }
        return result;
    }
}

export default RouteProcessor;
