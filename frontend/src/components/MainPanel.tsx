import React, { useEffect, useRef, useState } from "react";
import TableRoute from "./TableRoute";
import TableHolds from "./TableHolds";
import { Hold } from "../types";
import { BACKEND_ENDPOINT } from "../configs";
import Player from "./Player/Player";
import { Member } from "../utils/utils";
import { buildHttpHeaders, fetchFn } from "../utils/http";
import AppModal from "./AppModal";
import { AlertType, useAlert } from "./UI/AlertProvider";

const MainPanel = () => {
    const tableRouteRef = useRef<{ resetPanel: () => void }>();
    const appModalRef = useRef<{ openModal: () => void }>();
    const { showAlert } = useAlert();

    const [holds, setHolds] = useState<Hold[]>([]);
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
            const response = await fetchFn(`${BACKEND_ENDPOINT}/holds-info`, buildHttpHeaders());
            if (!response.ok) {
                showAlert({ title: "Error", description: "Failed to get holds", type: AlertType.ERROR });
                setHolds([]);
            }
            const data: Hold[] = await response.json();
            setHolds([...data]);
        }
        getHolds();
    }, [showAlert]);

    return (
        <>
            <AppModal ref={appModalRef} resetPanel={tableRouteRef.current?.resetPanel} />
            <div className="main-container">
                <div
                    className={`table-holds-container w1/3 ${audioFiles.length ? "justify-between" : "justify-center"}`}
                >
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
                    setRouteHighlight={setRouteHighlight}
                />
            </div>
        </>
    );
};

export default MainPanel;
