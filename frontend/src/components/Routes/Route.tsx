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
import { MapPinIcon } from "@heroicons/react/24/outline";

import { FacebookShareButton, WhatsappShareButton, FacebookIcon, WhatsappIcon } from "react-share";
import { UserGymRole } from "../Gyms/Gyms";

type ShareButtonsProps = {
    url: string;
    title: string;
    description?: string;
};

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
    userRole: UserGymRole;
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

    const ShareButtons = ({ url, title }: ShareButtonsProps) => {
        return (
            <div className="pt-3">
                <h3>Share this page:</h3>
                <div className="flex pt-2 space-x-2">
                    <FacebookShareButton url={url} title={title}>
                        <FacebookIcon size={32} round />
                    </FacebookShareButton>

                    <WhatsappShareButton url={url} title={title}>
                        <WhatsappIcon size={32} round />
                    </WhatsappShareButton>
                </div>
            </div>
        );
    };

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
                    <div
                        className={`hero-content flex-col ${data?.userRole ? "items-start justify-between" : "items-center"} lg:flex-row w-full`}
                    >
                        <img
                            ref={imageRef}
                            alt={`${data?.route.gym.name} climbing gym`}
                            className="min-w-96 lg:max-w-114"
                        ></img>
                        <div>
                            <Link to={`/gym/${data?.route.gym_id}`} className="flex items-center mb-8">
                                <MapPinIcon className="w-10 h-10"></MapPinIcon>
                                <span className="text-indigo-700 font-medium">{data?.route.gym.name}</span>
                            </Link>
                            {data?.userRole && (
                                <Link
                                    to={`/route-creator/${data?.route.gym_id}?route_id=${data.route.id}`}
                                    className="btn btn-primary"
                                >
                                    Edit route
                                </Link>
                            )}
                            <ShareButtons title={data?.route.name || ""} url={window.location.href} />
                        </div>
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
