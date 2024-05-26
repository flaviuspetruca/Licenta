import { Link } from "react-router-dom";
import { RouteQueryData } from "./Route";
import { getDifficultyClass } from "../../utils/utils";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";

export const RouteCard = ({ route }: { route: RouteQueryData }) => {
    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        if (imageRef.current && route.thumbnail) {
            imageRef.current.src = URL.createObjectURL(route.thumbnail);
        }
    }, [route.thumbnail]);
    return (
        <section className="lg:flex mb-5 h-fit">
            <div className="card-image" title={route.name}>
                <img ref={imageRef} alt={`${route.name} climbing route`} className="w-full h-full"></img>
            </div>
            <div className="card-body">
                <header>
                    <h1 className="text-gray-900 font-bold text-3xl mb-4">{route.name}</h1>
                    <div className="flex text-lg gap-1 font-semibold">
                        <span className="text-gray-700">Difficulty:</span>
                        <span className={getDifficultyClass(route.difficulty)}>{route.difficulty}</span>
                    </div>
                </header>
                <Link to={`/gym/${route.gym_id}`} className="flex items-center mb-8">
                    <MapPinIcon className="w-6 h-6"></MapPinIcon>
                    <span className="text-indigo-700 font-medium">{route.gym.name}</span>
                </Link>
                <main className="flex items-center justify-between">
                    <div className="flex text-sm gap-1">
                        <span className="text-gray-900">Created by: </span>
                        <span className="font-semibold italic">{route.user.username}</span>
                    </div>
                    <Link className="link-as-btn" to={`/route/${route.id}`}>
                        View route
                    </Link>
                </main>
            </div>
        </section>
    );
};
