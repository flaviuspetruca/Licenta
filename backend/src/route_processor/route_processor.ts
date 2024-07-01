import { __dirname } from "../index";
import { PANEL_HEIGHT } from "../configs/globals";
import { Coordinates, Matrix, Member, MemberMoveInfo, Position, ProcessedPosition } from "../configs/types";
import { AudioGenerator } from "./audio_generator";
import RouteComputer from "./compute";
import { TextGenerator } from "./text_generator";
import { Actor } from "../actor";

type RouteProcessorProps = {
    matrix: Matrix;
    positions: Position[];
};

class RouteProcessor extends Actor {
    routeComputer: RouteComputer;
    textGenerator: TextGenerator;
    audioGenerator: AudioGenerator;

    constructor() {
        super();
        this.routeComputer = new RouteComputer();
        this.audioGenerator = new AudioGenerator();
        this.textGenerator = new TextGenerator();
    }

    async processRoute({ matrix, positions }: RouteProcessorProps) {
        const processedPositions = this.processPositions(positions);
        const generatedTexts = this.textGenerator.generateTexts(processedPositions);
        const audioFilesZip = await this.audioGenerator.generateAudioData(generatedTexts);
        return { audioFilesZip, processedPositions };
    }

    /**
     * In order to create a fake starting position,
     * there is a need of a first position to be passed as an argument
     * it needs to use the x coordinates, to simulate the person standing in front of the wall
     * It is considered the person is starting the track standing straight
     */
    private _makeStartingPosition(firstPosition: Position) {
        // TODO: index might be out of bounds if left hold is on the right edge of the wall
        const position: Position = {
            "left-hand": {
                x: PANEL_HEIGHT - 2, // -2 because we want the hands to be at hip level
                y: firstPosition["left-hand"].y + 1,
            },
            "right-hand": {
                x: PANEL_HEIGHT - 2, // -2 because we want the hands to be at hip level
                y: firstPosition["right-hand"].y - 1,
            },
            "left-foot": {
                x: PANEL_HEIGHT,
                y: firstPosition["left-foot"].y + 1,
            },
            "right-foot": {
                x: PANEL_HEIGHT,
                y: firstPosition["right-foot"].y - 1,
            },
        };
        return position;
    }

    private _getLowestCoordinate(position?: Position) {
        let lowestCoordinate = PANEL_HEIGHT;
        if (position) {
            lowestCoordinate = 0;
            for (const [_member, coordinates] of Object.entries(position)) {
                if (coordinates.x >= lowestCoordinate) {
                    lowestCoordinate = coordinates.x;
                }
            }
        }
        return lowestCoordinate;
    }

    hasDifferentCoordinates(member1: Coordinates, member2: Coordinates) {
        if (member1.x === member2.x && member1.y === member2.y) {
            return false;
        } else {
            return true;
        }
    }

    processPositions(positions: Position[]) {
        const processedPositions: ProcessedPosition[] = [];
        // Handling first move where there is no current position
        const startingPosition = this._makeStartingPosition(positions[0]);
        let comparison = this.comparePlacements(positions[0], startingPosition);

        // handling rest of the moves
        processedPositions.push(comparison);
        for (let i = 0; i < positions.length - 1; i++) {
            comparison = this.comparePlacements(positions[i + 1], positions[i]);
            processedPositions.push(comparison);
        }
        return processedPositions;
    }

    processCoordinates(destinationCoordinates: Coordinates, sourceCoordinates: Coordinates, lowestCoordinate: number) {
        const distance = this.routeComputer.computeDistance(destinationCoordinates, sourceCoordinates);
        if (!distance) {
            throw new Error("Distance is too far to compute.");
        }
        const direction = this.routeComputer.computeDirection(destinationCoordinates, sourceCoordinates);
        const heightLevel = this.routeComputer.computeHeightLevel(destinationCoordinates, lowestCoordinate);
        const isDifferent = this.hasDifferentCoordinates(destinationCoordinates, sourceCoordinates);
        return {
            distance,
            direction,
            heightLevel,
            isDifferent,
        };
    }

    comparePlacements(destinationPosition: Position, sourcePosition: Position) {
        const _initMemberMoveInfo = (): MemberMoveInfo => ({
            distance: undefined,
            direction: undefined,
            heightLevel: undefined,
            isDifferent: undefined,
        });

        const result: ProcessedPosition = {
            "left-hand": _initMemberMoveInfo(),
            "right-hand": _initMemberMoveInfo(),
            "left-foot": _initMemberMoveInfo(),
            "right-foot": _initMemberMoveInfo(),
        };

        const lowestCoordinate = this._getLowestCoordinate(sourcePosition);

        for (const [key, destinationCoordinates] of Object.entries(destinationPosition)) {
            const member = key as Member;
            const sourceCoordinates = sourcePosition[member];
            result[member] = this.processCoordinates(destinationCoordinates, sourceCoordinates, lowestCoordinate);
        }
        return result;
    }
}

const processor = new RouteProcessor();
export default processor;
