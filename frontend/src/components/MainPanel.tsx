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
import Loading from "./Loading";
import { RouteTotalData } from "./Routes/Route";

type TableRouteRef = {
    resetPanel: () => void;
    setMatrix: (matrix: Matrix) => void;
    setPositions: (positions: Position[]) => void;
};

const MainPanel = () => {
    const tableRouteRef = useRef<TableRouteRef>();
    const appModalRef = useRef<{ openModal: () => void }>();
    const { showAlert } = useAlert();

    const [holds, setHolds] = useState<Hold[]>([]);
    const [audioFiles, setAudioFiles] = useState<{ audio: string; member: string }[][]>([]);
    const [startRouting, setStartRouting] = useState<boolean>(false);
    const [routeName, setRouteName] = useState<string>("");
    const [routeHighlight, setRouteHighlight] = useState<{ positionIndex: number; member: Member } | undefined>(
        undefined
    );

    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function verifyAdmin() {
            setLoading(true);
            await fetchFn(`${BACKEND_ENDPOINT}/verify-admin-gym/${id}`, buildHttpHeaders());
            setLoading(false);
        }

        async function getRoute() {
            const queryParams = new URLSearchParams(location.search);
            const route_id = queryParams.get("route_id");
            if (!route_id) {
                return;
            }
            setLoading(true);
            const response = await fetchFn(`${BACKEND_ENDPOINT}/route/${route_id}`, buildHttpHeaders());
            if (!response.ok) {
                return;
            }
            setLoading(false);
            const data: RouteTotalData = await response.json();
            tableRouteRef.current?.setMatrix(data.matrix);
            tableRouteRef.current?.setPositions(data.positions);
            setAudioFiles(data.audioFiles);
        }
        verifyAdmin();
        getRoute();
    }, [id, location]);

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
        <Loading isLoading={loading}>
            <AppModal
                title="Are you sure you want to reset the panel?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
                ref={appModalRef}
                resetPanel={tableRouteRef.current?.resetPanel}
            />
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
        </Loading>
    );
};

export default MainPanel;
