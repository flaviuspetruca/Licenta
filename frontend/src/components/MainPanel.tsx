import React, { useEffect, useRef, useState } from "react";
import TableRoute from "./TableRoute";
import TableHolds from "./TableHolds";
import { Hold } from "../types";
import { BACKEND_ENDPOINT } from "../configs";
import Player from "./Player/Player";
import { Member } from "../utils/utils";
import { ErrorBoundary } from "react-error-boundary";
import AppModal from "./AppModal";

const MainPanel = () => {
    const tableRouteRef = useRef<{ resetPanel: () => void }>();
    const appModalRef = useRef<{ openModal: () => void }>();

    const [holds, setHolds] = useState<Map<string, Hold>>(new Map());
    const [audioFiles, setAudioFiles] = useState<{ audio: string; member: string }[][]>([]);
    const [startRouting, setStartRouting] = useState<boolean>(false);
    const [routeName, setRouteName] = useState<string>("");
    const [routeHighlight, setRouteHighlight] = useState<{ positionIndex: number; member: Member } | undefined>(
        undefined
    );

    const handleStartRouting = () => {
        setStartRouting(!startRouting);
        setRouteHighlight(undefined);
    };

    useEffect(() => {
        async function getHolds() {
            try {
                const response = await fetch(`${BACKEND_ENDPOINT}/holds-info`);
                const data = await response.json();
                setHolds((prevHolds) => {
                    if (JSON.stringify(prevHolds) !== JSON.stringify(data)) {
                        const holdsMapStructure: Map<string, Hold> = new Map();
                        for (const [key, value] of Object.entries<Hold>(data)) {
                            holdsMapStructure.set(key, value);
                        }
                        return holdsMapStructure;
                    } else {
                        return prevHolds;
                    }
                });
            } catch (error) {
                console.error("Error fetching holds:", error);
                setHolds(new Map());
            }
        }
        getHolds();
    }, []);

    useEffect(() => {
        setAudioFiles([]);
    }, [startRouting]);

    return (
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <AppModal ref={appModalRef} resetPanel={tableRouteRef.current?.resetPanel} />
            <div className="main-container">
                <div className={`table-holds-container ${audioFiles.length ? "justify-between" : "justify-center"}`}>
                    <TableHolds
                        numRows={8}
                        numCols={6}
                        holds={holds}
                        startRouting={startRouting}
                        setStartRouting={handleStartRouting}
                        routeName={routeName}
                        setRouteName={setRouteName}
                        transition={audioFiles.length > 0}
                    />
                    {audioFiles.length === 0 ? (
                        <></>
                    ) : (
                        <Player
                            audioFiles={audioFiles}
                            setRouteHighlight={setRouteHighlight}
                            transition={Object.keys(audioFiles).length > 0}
                        ></Player>
                    )}
                </div>
                <TableRoute
                    ref={tableRouteRef}
                    openModal={appModalRef.current?.openModal}
                    numRows={10}
                    numCols={15}
                    startRouting={startRouting}
                    routeName={routeName}
                    setAudioFiles={setAudioFiles}
                    hasAudioFiles={Object.keys(audioFiles).length > 0}
                    routeHighlight={routeHighlight}
                />
            </div>
        </ErrorBoundary>
    );
};

export default MainPanel;
