import { Link } from "react-router-dom";
import { GymQueryData } from "./Gyms";
import { useEffect, useRef } from "react";

export const GymCard = ({ gym }: { gym: GymQueryData }) => {
    const urlPath = `/gym/${gym.id}`;
    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        if (imageRef.current && gym.thumbnail) {
            imageRef.current.src = URL.createObjectURL(gym.thumbnail);
        }
    }, [gym.thumbnail]);
    return (
        <section className="lg:flex mb-3">
            <div className="card-image" title={gym.name}>
                <img ref={imageRef} alt={`${gym.name} climbing gym`} className="w-full h-full"></img>
            </div>
            <div className="card-body">
                <header className="mb-8">
                    <h1 className="text-gray-900 font-bold text-3xl mb-2">{gym.name}</h1>
                    <p className="text-gray-700 text-lg">{gym?.nr_routes} Accessible Routes</p>
                </header>
                <main className="flex items-center justify-between">
                    <div className="text-md">
                        <p className="text-gray-900 leading-none">Administrator: {gym.users[0].username} </p>
                    </div>
                    <Link className="link-as-btn" aria-label={`View details for ${gym.name}`} to={urlPath}>
                        View gym
                    </Link>
                </main>
            </div>
        </section>
    );
};
