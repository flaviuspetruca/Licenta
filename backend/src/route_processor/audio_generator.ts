import fetch from "node-fetch";
import { NEXT_POSITION_AUDIO, END_AUDIO, AUDIO_BACKEND } from "../configs/globals";
import { ProcessedPosition } from "../configs/types";
import { Actor } from "../actor";

export class AudioGenerator extends Actor {
    async generateAudioData(generatedTexts: string[]) {
        const audioFilesZip = await this.textToSpeech(generatedTexts);
        return audioFilesZip;
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
        const zip = await response.blob();
        return zip;
    }

    public static buildAudioData(audioFiles: string[], processedPositions: ProcessedPosition[]) {
        const generatedAudioData: { audioFileName: string; member: string }[][] = [];
        for (let i = 0; i < processedPositions.length; i++) {
            const audioData: {
                audioFileName: string;
                member: string;
            }[] = [];

            for (const key of Object.keys(processedPositions[i])) {
                audioData.push({
                    audioFileName: `${audioFiles.shift()}`,
                    member: key,
                });
            }

            if (i < processedPositions.length - 1) {
                audioData.push({
                    audioFileName: NEXT_POSITION_AUDIO,
                    member: "Next position",
                });
            } else {
                audioData.push({
                    audioFileName: END_AUDIO,
                    member: "End of track",
                });
            }

            generatedAudioData.push(audioData);
        }
        return generatedAudioData;
    }
}
