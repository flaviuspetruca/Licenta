import React, { useState, useEffect, useRef } from "react";
import { AUDIO_BACKEND_ENDPOINT } from "../../configs";
import { Member } from "../../utils/utils";
import { fetchFn } from "../../utils/http";
import { ReactComponent as DownloadSvg } from "../../assets/download.svg";
import Spinner from "../UI/Spinner";
import { AlertType, useAlert } from "../UI/AlertProvider";
import { AudioData } from "../MainPanel";

type Props = {
    audioData: AudioData | undefined;
    setRouteHighlight: React.Dispatch<React.SetStateAction<{ positionIndex: number; member: Member } | undefined>>;
    transition: boolean;
};

const Player = ({ audioData, setRouteHighlight, transition }: Props) => {
    const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
    const { showAlert } = useAlert();
    const audioPlayer = useRef<HTMLAudioElement>(null);

    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const handleRouteHighlight = () => {
            setRouteHighlight({
                positionIndex: currentPositionIndex,
                member: audioData?.data[currentPositionIndex][currentAudioIndex].member as Member,
            });
        };

        if (audioPlayer && audioPlayer.current) {
            // Update audio source when current audio index changes
            if (audioData?.data.length === 0) return;
            console.log(audioData);
            const blobName = audioData?.data[currentPositionIndex][currentAudioIndex].audioFileName;
            const blob = audioData?.blobs.find((blob) => blob.name === blobName);
            if (!blob) {
                showAlert({ title: "Error", description: "Failed to load audio", type: AlertType.ERROR });
                return;
            }
            audioPlayer.current.src = URL.createObjectURL(blob as Blob);
            audioPlayer.current.load();
            audioPlayer.current.pause();
            handleRouteHighlight();
        }
    }, [currentAudioIndex, currentPositionIndex, audioData, audioPlayer, setRouteHighlight, showAlert]);

    const handleAudioChange = (direction: "next" | "previous") => {
        if (!audioData) return;
        const isNext = direction === "next";
        const isAtEnd = currentAudioIndex === audioData.data[currentPositionIndex].length - 1;
        const isAtStart = currentAudioIndex === 0;
        const isLastPosition = currentPositionIndex === Object.keys(audioData.data).length - 1;
        const isFirstPosition = currentPositionIndex === 0;

        if ((isNext && isAtEnd) || (!isNext && isAtStart)) {
            const newPositionIndex = isNext
                ? isLastPosition
                    ? 0
                    : currentPositionIndex + 1
                : isFirstPosition
                  ? Object.keys(audioData.data).length - 1
                  : currentPositionIndex - 1;
            setCurrentPositionIndex(newPositionIndex);
            const newAudioIndex = isNext ? 0 : audioData.data[newPositionIndex].length - 1;
            setCurrentAudioIndex(newAudioIndex);
        } else {
            const newAudioIndex = isNext ? currentAudioIndex + 1 : currentAudioIndex - 1;
            setCurrentAudioIndex(newAudioIndex);
        }
    };

    const handleNextAudio = () => handleAudioChange("next");
    const handlePreviousAudio = () => handleAudioChange("previous");

    const handleDownloadAudio = async () => {
        if (downloading) return;
        if (!audioData) {
            showAlert({ title: "Error", description: "No audio data found", type: AlertType.ERROR });
            return;
        }

        setDownloading(true);
        const url = new URL(AUDIO_BACKEND_ENDPOINT);
        url.pathname = "/merge-audio";
        url.searchParams.append("directory_path", audioData?.path);
        const response = await fetchFn(url.toString(), {
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        });
        setDownloading(false);

        if (!response.ok) {
            showAlert({ title: "Error", description: "Failed to download audio", type: AlertType.ERROR });
            return;
        }

        const blob = await response.blob();
        const urlParts = url.toString().split("/");
        const filename = urlParts[urlParts.length - 1];

        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(blobUrl);
    };

    const transitionClass = transition ? "animate-drop-off" : "";

    return (
        <div className={`w-full p-4 bg-gray-100 rounded-b-xl ${transitionClass}`}>
            <audio
                ref={audioPlayer}
                controls
                autoPlay
                className="w-full mb-4"
                style={{
                    border: "4px orange solid",
                    borderRadius: "25px",
                }}
            />
            <div className="flex justify-between">
                <div className="flex justify-center items-center rounded-full bg-orange-500 w-auto px-3 h-10">
                    <p className="text-white text-sm font-semibold text-center py-2">{`Position ${currentPositionIndex + 1}`}</p>
                </div>
                <div className="flex space-x-1">
                    <button
                        aria-label="Download audio"
                        title="Download audio"
                        className="btn btn-square bg-gray-100"
                        onClick={handleDownloadAudio}
                    >
                        {!downloading ? <DownloadSvg className="max-h-8 max-w-8" /> : <Spinner />}
                    </button>
                    <button
                        aria-label="Previous audio"
                        onClick={handlePreviousAudio}
                        className="btn px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                    >
                        Previous
                    </button>
                    <button
                        aria-label="Next audio"
                        onClick={handleNextAudio}
                        className="btn px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Player;
