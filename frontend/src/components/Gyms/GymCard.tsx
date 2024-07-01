import { Link } from "react-router-dom";
import { GymQueryData } from "./Gyms";
import { useEffect, useRef } from "react";

export type GymCardType = "submission" | "gym";

const getStatusStyle = (status: string) => {
    switch (status) {
        case "PENDING":
            return "text-yellow-700";
        case "APPROVED":
            return "text-green-700";
        case "REJECTED":
            return "text-red-700";
        default:
            return "text-gray-700";
    }
};

export const GymCard = ({ gym, type }: { gym: GymQueryData; type: GymCardType }) => {
    const urlPath = type === "gym" ? `/gym/${gym.id}` : `/submission/${gym.id}`;
    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        if (imageRef.current && gym.thumbnail) {
            imageRef.current.src = URL.createObjectURL(gym.thumbnail);
        }
    }, [gym.thumbnail]);
    return (
        <section className="lg:flex mb-3">
            <figure className="card-image">
                <img
                    ref={imageRef}
                    alt={`${gym.name} climbing gym`}
                    className="w-full h-full"
                    aria-label={`${gym.name} climbing gym`}
                ></img>
                <figcaption className="sr-only">{gym.name}</figcaption>
            </figure>
            <div className="card-body">
                <header className="mb-8">
                    <h1 className="text-gray-900 font-bold text-3xl mb-2">{gym.name}</h1>
                    {type !== "submission" && (
                        <p className="text-gray-700 text-lg">
                            <b>{gym?.nr_routes ?? 0}</b> accessible routes
                        </p>
                    )}
                    {type === "submission" && (
                        <div className="flex text-lg gap-1 font-semibold">
                            <span className="text-gray-700">Status:</span>
                            <span className={getStatusStyle(gym.status || "")}>{gym.status}</span>
                        </div>
                    )}
                </header>
                <main className="flex items-center justify-between">
                    {gym.users && gym.users.length > 0 && (
                        <div className="flex text-sm gap-1">
                            <span className="text-gray-900">Created by: </span>
                            <span className="font-semibold italic">{gym.users[0].username}</span>
                        </div>
                    )}
                    <Link className="link-as-btn" aria-label={`View details for`} to={urlPath}>
                        View gym
                    </Link>
                </main>
            </div>
        </section>
    );
};
