import React, { useEffect, useRef, useState } from "react";
import "./MainPanel.scss";
import TableRoute from "./TableRoute";
import TableHolds from "./TableHolds";
import { Hold, Matrix, Position } from "../types";
import { BACKEND_ENDPOINT } from "../configs";
import Player from "./Player/Player";
import { Member } from "../utils/utils";
import { buildHttpHeaders, fetchFn } from "../utils/http";
import AppModal from "./AppModal";
import { AlertType, useAlert } from "./UI/AlertProvider";
import { useLocation, useParams } from "react-router-dom";
import LoadingWrapper from "./UI/LoadingWrapper";

type TableRouteRef = {
    resetPanel: () => void;
    setMatrix: (matrix: Matrix) => void;
    setRouteName: (name: string) => void;
    setDifficulty: (difficulty: string) => void;
    handleSetRetrievedPositions: (positions: Position[]) => void;
    handleEdit: () => void;
};

export type AudioData = {
    path: string;
    data: { audioFileName: string; member: string }[][];
    blobs: File[];
};

const MainPanel = () => {
    const tableRouteRef = useRef<TableRouteRef>();
    const appModalRef = useRef<{ openModal: () => void }>();
    const { showAlert } = useAlert();

    const [holds, setHolds] = useState<Hold[]>([]);
    const [audioData, setAudioData] = useState<AudioData | undefined>();
    const [routeHighlight, setRouteHighlight] = useState<{ positionIndex: number; member: Member } | undefined>(
        undefined
    );

    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function verifyAdmin() {
            await fetchFn(`${BACKEND_ENDPOINT}/verify-admin-gym/${id}`, buildHttpHeaders());
        }

        verifyAdmin();
    }, [id, location, showAlert]);

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
        <LoadingWrapper isLoading={loading} text="Route Creator">
            <AppModal
                title="Are you sure you want to reset the panel?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
                ref={appModalRef}
                resetPanel={tableRouteRef.current?.resetPanel}
            />
            <div className="flex flex-row overflow-x-auto w-full">
                <div className="main-container">
                    <div
                        className={`table-holds-container ${!!audioData?.data.length ? "justify-between" : "justify-center"}`}
                    >
                        <TableHolds numRows={8} numCols={6} holds={holds} transition={!!audioData?.data.length} />
                        {audioData?.data.length ? (
                            <Player
                                audioData={audioData}
                                setRouteHighlight={setRouteHighlight}
                                transition={Object.keys(audioData?.data || []).length > 0}
                            ></Player>
                        ) : (
                            <></>
                        )}
                    </div>
                    <TableRoute
                        ref={tableRouteRef}
                        openModal={appModalRef.current?.openModal}
                        numRows={10}
                        numCols={15}
                        audioData={audioData}
                        setAudioData={setAudioData}
                        hasAudioFiles={Object.keys(audioData?.data || []).length > 0}
                        routeHighlight={routeHighlight}
                        setRouteHighlight={setRouteHighlight}
                        setLoading={setLoading}
                    />
                </div>
            </div>
        </LoadingWrapper>
    );
};

export default MainPanel;
