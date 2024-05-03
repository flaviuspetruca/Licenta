import { Actor } from "../actor";
import { Request } from "../utils/http";
import { HeightLevel, Member, MemberMoveInfo, ProcessedPosition } from "../configs/types";

export class TextGenerator extends Actor {
    constructor() {
        super();
    }

    generateTexts(req: Request, processedPositions: ProcessedPosition[]) {
        this.handle_request(req);
        const generatedTexts = processedPositions.flatMap((position, i) => {
            const texts = [];
            for (const [key, info] of Object.entries(position)) {
                const member = key as Member;
                if (info.isDifferent) {
                    texts.push(this.generateMemberText(member, info, i === 0));
                }
            }
            return texts;
        });
        return generatedTexts;
    }

    generateMemberText(member: Member, info: MemberMoveInfo, firstMove = false) {
        if (!info.isDifferent) {
            if (firstMove) {
                return `Starting hold for your ${member} is at your ${this.heightLevelToBodyPart(info.heightLevel)} level. The hold is ${info.distance} and to the ${info.direction}`;
            }
            return `Keep your ${member} in the same position`;
        }
        if (firstMove) {
            return `Starting hold for your ${member} is at your ${this.heightLevelToBodyPart(info.heightLevel)} level. The hold is ${info.distance} and to the ${info.direction}`;
        } else {
            return `Place your ${member} at your ${this.heightLevelToBodyPart(info.heightLevel)} level. The hold is ${info.distance} and to the ${info.direction}`;
        }
    }

    heightLevelToBodyPart(heightLevel: HeightLevel) {
        switch (heightLevel) {
            case HeightLevel.LEGS:
                return "legs";
            case HeightLevel.THIGHS_KNEES:
                return "thighs and knees";
            case HeightLevel.HIPS:
                return "hips";
            case HeightLevel.UPPER_BODY:
                return "upper body";
            case HeightLevel.HEAD:
                return "head";
            case HeightLevel.OVERHEAD:
                return "overhead";
            case HeightLevel.OUT_OF_REACH:
                return "out of reach";
        }
    }
}
