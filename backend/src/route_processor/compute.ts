import {
    Coordinates,
    Distance,
    HeightLevel,
    Position,
    Direction,
} from "../configs/types";
import {
    CELL_EDGE_SIZE,
    CLOSE_LIMIT_DISTANCE,
    FAR_LIMIT_DISTANCE,
    MEMBERS,
} from "./route_processor";

type HeightLevelMembers = {
    hands: {
        leftMember: HeightLevel | null;
        rightMember: HeightLevel | null;
    };
    feet: {
        leftMember: HeightLevel | null;
        rightMember: HeightLevel | null;
    };
};

// TODO: move this to configs
const STARTING_LEVELS: HeightLevelMembers = {
    hands: {
        leftMember: HeightLevel.HIPS,
        rightMember: HeightLevel.HIPS,
    },
    feet: {
        leftMember: HeightLevel.LEGS,
        rightMember: HeightLevel.LEGS,
    },
};

const PANEL_HEIGHT = 10;
const PANEL_WIDTH = 15;

/**
 * This class is responsible for computing the route
 * It uses the previous position to compute the next position
 * It uses the previous height levels to compute the next height levels
 * It uses coordinates that are relative to the matrix cells
 */
class RouteComputer {
    previousHeightLevels: HeightLevelMembers;
    startingLevels: HeightLevelMembers;
    startingPosition: Position;
    constructor(firstPosition: Position) {
        this.startingLevels = STARTING_LEVELS;
        this.previousHeightLevels = this.startingLevels;
        this.startingPosition = this._makeStartingPosition(firstPosition);
    }

    /**
     * In order to create a fake starting position,
     * there is a need of a first position to be passed as an argument
     * it needs to use the x coordiantes, to simulate the person standing in front of the wall
     * It is considered the person is starting the track standing straight
     */
    private _makeStartingPosition(firstPosition: Position) {
        // TODO: index might be out of bounds if left hold is on the right edge of the wall
        const position: Position = {
            hands: {
                leftMember: {
                    x: PANEL_HEIGHT - 2, // -2 because we want the hands to be at hip level
                    y: firstPosition.hands.leftMember.y,
                },
                rightMember: {
                    x: PANEL_HEIGHT - 2, // -2 because we want the hands to be at hip level
                    y: firstPosition.hands.leftMember.y,
                },
            },
            feet: {
                leftMember: {
                    x: PANEL_HEIGHT,
                    y: firstPosition.feet.leftMember.y,
                },
                rightMember: {
                    x: PANEL_HEIGHT,
                    y: firstPosition.feet.leftMember.y,
                },
            },
        };
        return position;
    }
    computeDistance(
        destinationCoordinates: Coordinates,
        sourceCoordinates: Coordinates
    ) {
        const distance = Math.sqrt(
            Math.pow(
                (destinationCoordinates.x - sourceCoordinates.x) *
                    CELL_EDGE_SIZE,
                2
            ) +
                Math.pow(
                    (destinationCoordinates.y - sourceCoordinates.y) *
                        CELL_EDGE_SIZE,
                    2
                )
        );

        if (distance <= CLOSE_LIMIT_DISTANCE) {
            return Distance.CLOSE;
        } else if (distance <= FAR_LIMIT_DISTANCE) {
            return Distance.FAR;
        } else {
            return null;
        }
    }

    computeDirection(
        destinationCoordinates: Coordinates,
        sourceCoordinates: Coordinates
    ) {
        if (sourceCoordinates.y < destinationCoordinates.y) {
            return Direction.RIGHT;
        } else {
            return Direction.LEFT;
        }
    }

    computeHeightLevelMember(
        destinationCoordinates: Coordinates,
        sourceCoordinates: Coordinates,
        previousHeightLevel: HeightLevel
    ) {
        const nextHeightLevel =
            (sourceCoordinates.x - destinationCoordinates.x) * CELL_EDGE_SIZE +
            previousHeightLevel; // source - dest because the y axis is inverted due to matrix coordinates
        return nextHeightLevel as HeightLevel;
    }

    // TODO: refactor this function
    /**
     * Compute the height levels of all members for the destination position based on the source position
     * @param destinationPosition
     * @param sourcePosition
     */
    computeHeightLevels(
        destinationPosition: Position,
        sourcePosition: Position
    ) {
        const resultLevels: HeightLevelMembers = {
            hands: {
                leftMember: null,
                rightMember: null,
            },
            feet: {
                leftMember: null,
                rightMember: null,
            },
        };

        for (const [member, side] of MEMBERS) {
            const destMember = destinationPosition[member][side];
            const sourceMember = sourcePosition
                ? sourcePosition[member][side]
                : this.startingPosition[member][side];
            const previousHeightLevel = this.previousHeightLevels[member][side];
            if (sourceMember && destMember) {
                const destLevel = this.computeHeightLevelMember(
                    destMember,
                    sourceMember,
                    previousHeightLevel
                );
                resultLevels[member][side] = destLevel;
            } else {
                // throw error
            }
        }

        return resultLevels;
    }
}

export default RouteComputer;
