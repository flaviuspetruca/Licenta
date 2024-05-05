import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../../configs";
import { Member } from "../../utils/utils";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { Matrix, Position } from "../../types";
import RouteSettingTable from "../RouteSettingTable/RouteSettingTable";
import Player from "../Player/Player";
import LoadingWrapper from "../UI/LoadingWrapper";
import { AlertType, useAlert } from "../UI/AlertProvider";

export type RouteQueryData = {
    id: number;
    name: string;
    dir_id: string;
    gym_id: number;
    gym: {
        name: string;
        location: string;
    };
    user: {
        username: string;
    };
};

export type RouteTotalData = {
    route: RouteQueryData;
    matrix: Matrix;
    positions: Position[];
    audioFiles: {
        audio: string;
        member: string;
    }[][];
    admin: boolean;
};

const Route = () => {
    const [loading, setLoading] = useState(true);
    const [currentPosition, setCurrentPosition] = useState<Position>();
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
    const [routeHighlight, setRouteHighlight] = useState<{ positionIndex: number; member: Member } | undefined>(
        undefined
    );
    const { showAlert } = useAlert();
    const [data, setData] = useState<RouteTotalData>();
    const { id } = useParams();

    useEffect(() => {
        if (routeHighlight) {
            setCurrentPosition(data?.positions[routeHighlight.positionIndex]);
            setCurrentPositionIndex(routeHighlight.positionIndex);
        }
    }, [routeHighlight, currentPositionIndex, data]);

    const previousPosition = useMemo(() => {
        if (currentPositionIndex === 0) {
            return undefined;
        }
        return data?.positions[currentPositionIndex - 1];
    }, [currentPositionIndex, data]);

    useEffect(() => {
        async function getRoute() {
            setLoading(true);
            const response = await fetchFn(`${BACKEND_ENDPOINT}/route/${id}`, buildHttpHeaders());
            setLoading(false);
            if (!response.ok) {
                showAlert({ title: "Error", description: "Failed to retrieve route", type: AlertType.ERROR });
                setData(undefined);
            }
            const data = await response.json();
            setData(data);
        }
        getRoute();
    }, [id, showAlert]);
    return (
        <LoadingWrapper isLoading={loading} text={data?.route.name}>
            <section>
                <div className="hero bg-base-200">
                    <div className="hero-content flex-col lg:flex-row">
                        <img
                            src="/outputs/route.jpg"
                            alt={`${data?.route.gym.name} climbing gym`}
                            className="w-full h-full"
                        ></img>
                        <div>
                            <h1 className="text-5xl font-bold">{data?.route.gym?.location}</h1>
                        </div>
                        {data?.admin && (
                            <Link
                                to={`/route-creator/${data?.route.gym_id}?route_id=${data.route.id}`}
                                className="btn btn-primary"
                            >
                                Edit route
                            </Link>
                        )}
                    </div>
                </div>
            </section>
            <section className="w-fit bg-route-setting-table p-6 rounded-2xl">
                <RouteSettingTable
                    matrix={data?.matrix}
                    currentPosition={currentPosition}
                    previousPosition={previousPosition}
                    highlightedMember={routeHighlight?.member}
                />
                <Player audioFiles={data?.audioFiles || []} transition setRouteHighlight={setRouteHighlight} />
            </section>
        </LoadingWrapper>
    );
};

export default Route;
