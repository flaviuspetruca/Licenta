import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../../configs";
import { Member } from "../../utils/utils";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { Matrix, Position } from "../../types";
import RouteSettingTable from "../RouteSettingTable/RouteSettingTable";
import Player from "../Player/Player";
import LoadingWrapper from "../UI/LoadingWrapper";
import { AlertType, useAlert } from "../UI/AlertProvider";
import { AudioData } from "../MainPanel";

export type RouteQueryData = {
    id: number;
    name: string;
    dir_id: string;
    gym_id: number;
    difficulty: string;
    thumbnail: Blob;
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
    thumbnail: Blob;
    admin: boolean;
} & AudioData;

const Route = () => {
    const [loading, setLoading] = useState(true);
    const [currentPosition, setCurrentPosition] = useState<Position>();
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
    const [routeHighlight, setRouteHighlight] = useState<{ positionIndex: number; member: Member } | undefined>(
        undefined
    );
    const [data, setData] = useState<RouteTotalData>();
    const imageRef = useRef<HTMLImageElement>(null);
    const { showAlert } = useAlert();
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

            const data = await response.formData();
            const routeData: RouteTotalData = JSON.parse(data.get("json_data") as string);
            if (!routeData) {
                showAlert({ title: "Error", description: "Failed to generate route. No data", type: AlertType.ERROR });
                return;
            }
            routeData.blobs = data.getAll("audio_blob") as File[];
            routeData.thumbnail = data.get("thumbnail") as Blob;
            imageRef.current!.src = URL.createObjectURL(routeData.thumbnail);
            setData(routeData);
        }
        getRoute();
    }, [id, showAlert]);
    return (
        <LoadingWrapper isLoading={loading} text={data?.route.name}>
            <section className="flex items-center justify-center w-full">
                <div className="hero bg-base-200 max-w-128">
                    <div className="hero-content flex-col lg:flex-row">
                        <img ref={imageRef} alt={`${data?.route.gym.name} climbing gym`} className="w-96"></img>
                        <div>
                            <h1 className="text-5xl font-bold">{data?.route.gym.name}</h1>
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
            <section className="flex items-center justify-center w-full">
                <div className="bg-route-setting-table p-6 rounded-2xl w-fit">
                    <RouteSettingTable
                        matrix={data?.matrix}
                        currentPosition={currentPosition}
                        previousPosition={previousPosition}
                        highlightedMember={routeHighlight?.member}
                    />
                    <Player audioData={data as AudioData} transition setRouteHighlight={setRouteHighlight} />
                </div>
            </section>
        </LoadingWrapper>
    );
};

export default Route;
