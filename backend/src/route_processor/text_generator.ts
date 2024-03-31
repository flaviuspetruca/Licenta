import { HeightLevel } from "../configs/types";
import fetch from "node-fetch";
import {
    NEXT_POSITION_AUDIO,
    END_AUDIO,
    MEMBER_MAP,
    AUDIO_BACKEND,
} from "../configs/globals";

export class TextGenerator {
    request_id: string;
    parsedPositions: any[];
    constructor(request_id: string, parsedPositions: any[]) {
        this.request_id = request_id;
        this.parsedPositions = parsedPositions;
    }

    // TODO: Refactor this function (NEED REFACTORING OF MEMBERS STRUCTURE)
    // TODO: Separate LOGIC for text generation and audio generation
    async generateText() {
        const generatedAudioData = new Map<number, Array<any>>([]);

        const generatedTexts = this.parsedPositions.flatMap((parsedText, i) =>
            Array.from(MEMBER_MAP.entries()).map(([member, [part, side]]) => {
                const position = parsedText[part][side];
                position.member = member;
                return this.generateMemberText(position, i === 0);
            })
        );

        const audioFiles = await this.textToSpeech(generatedTexts);

        let audioIndex = 0;
        for (let i = 0; i < this.parsedPositions.length; i++) {
            const audioData: {
                audio: string;
                member: string;
            }[] = [];

            for (let j = 0; j < MEMBER_MAP.size; j++) {
                audioData.push({
                    audio: audioFiles[audioIndex],
                    member: Array.from(MEMBER_MAP.keys())[j],
                });
                audioIndex++;
            }

            if (i < this.parsedPositions.length - 1) {
                audioData.push({
                    audio: NEXT_POSITION_AUDIO,
                    member: "Next position",
                });
            } else {
                audioData.push({
                    audio: END_AUDIO,
                    member: "End of track",
                });
            }

            generatedAudioData.set(i, audioData);
        }

        return generatedAudioData;
    }

    // TODO: Add member type to the member object
    generateMemberText(member: any, firstMove = false) {
        if (!member.isDifferent) {
            if (firstMove) {
                return `Starting hold for your ${member.member} is at your ${this.heightLevelToBodyPart(member.heightLevel)} level. The hold is ${member.distance} and to the ${member.direction}`;
            }
            return `Keep your ${member.member} in the same position`;
        }
        if (firstMove) {
            return `Starting hold for your ${member.member} is at your ${this.heightLevelToBodyPart(member.heightLevel)} level. The hold is ${member.distance} and to the ${member.direction}`;
        } else {
            return `Place your ${member.member} at your ${this.heightLevelToBodyPart(member.heightLevel)} level. The hold is ${member.distance} and to the ${member.direction}`;
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

    // TODO: ADD URL TO CONFIG
    async textToSpeech(generateMemberTexts: string[]) {
        const response = await fetch(AUDIO_BACKEND + "/text2speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                texts: generateMemberTexts,
            }),
        });
        if (response.status !== 200) {
            throw new Error("Failed to generate audio");
        }
        const audioFiles = (await response.json()) as string[];
        return audioFiles;
    }
}
