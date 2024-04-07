import fetch from "node-fetch";
import { NEXT_POSITION_AUDIO, END_AUDIO, AUDIO_BACKEND } from "../configs/globals";
import { ProcessedPosition } from "../configs/types";

export class AudioGenerator {
    async generateAudioData(generatedTexts: string[], processedPositions: ProcessedPosition[]) {
        const audioFiles = await this.textToSpeech(generatedTexts);
        return this.buildAudioData(audioFiles, processedPositions);
    }

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

    buildAudioData(audioFiles: string[], processedPositions: ProcessedPosition[]) {
        const generatedAudioData = new Map<number, { audio: string; member: string }[]>([]);
        for (let i = 0; i < processedPositions.length; i++) {
            const audioData: {
                audio: string;
                member: string;
            }[] = [];

            for (const key of Object.keys(processedPositions[i])) {
                audioData.push({
                    audio: audioFiles.shift(),
                    member: key,
                });
            }

            if (i < processedPositions.length - 1) {
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
}
