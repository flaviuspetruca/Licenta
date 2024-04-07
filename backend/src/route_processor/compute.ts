import { Coordinates, Distance, HeightLevel, Direction } from "../configs/types";
import { CELL_EDGE_SIZE, CLOSE_LIMIT_DISTANCE, FAR_LIMIT_DISTANCE } from "../configs/globals";
/**
 * This class is responsible for computing the route
 * It uses the previous position to compute the next position
 * It uses the previous height levels to compute the next height levels
 * It uses coordinates that are relative to the matrix cells
 */
class RouteComputer {
    computeDistance(destinationCoordinates: Coordinates, sourceCoordinates: Coordinates) {
        const distance = Math.sqrt(
            Math.pow((destinationCoordinates.x - sourceCoordinates.x) * CELL_EDGE_SIZE, 2) +
                Math.pow((destinationCoordinates.y - sourceCoordinates.y) * CELL_EDGE_SIZE, 2)
        );

        if (distance <= CLOSE_LIMIT_DISTANCE) {
            return Distance.CLOSE;
        } else if (distance <= FAR_LIMIT_DISTANCE) {
            return Distance.FAR;
        } else {
            return null;
        }
    }

    computeDirection(destinationCoordinates: Coordinates, sourceCoordinates: Coordinates) {
        if (sourceCoordinates.y < destinationCoordinates.y) {
            return Direction.RIGHT;
        } else {
            return Direction.LEFT;
        }
    }

    computeHeightLevel(destinationCoordinates: Coordinates, lowestXCoordinate: number) {
        const nextHeightLevel = (lowestXCoordinate - destinationCoordinates.x + 1) * CELL_EDGE_SIZE; // source - dest because the y axis is inverted due to matrix coordinates
        return nextHeightLevel as HeightLevel;
    }
}

export default RouteComputer;
