import { Link } from "react-router-dom";
import { GymQueryData } from "./Gyms";

export const GymCard = ({ gym }: { gym: GymQueryData }) => {
    const urlPath = `/gym/${gym.id}`;
    return (
        <section className="lg:flex mb-3">
            <div
                className=" h-72 lg:h-auto lg:w-72 flex-none bg-cover rounded-t-xl lg:rounded-t-none lg:rounded-l-xl text-center overflow-hidden"
                title={gym.name}
            >
                <img src="/outputs/gym.jpg" alt={`${gym.name} climbing gym`} className="w-full h-full"></img>
            </div>
            <div className="rounded-b-xl lg:rounded-b-none lg:rounded-r-xl border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white p-6 flex flex-col justify-between leading-normal">
                <header className="mb-8">
                    <h1 className="text-gray-900 font-bold text-3xl mb-2">
                        {gym.name} - {gym.location}
                    </h1>
                    <p className="text-gray-700 text-lg">{gym?.nr_routes} Accessible Routes</p>
                </header>
                <main className="flex items-cente justify-between">
                    <div className="text-md">
                        <p className="text-gray-900 leading-none">Administrator: {gym.users[0].username} </p>
                        <p className="text-gray-600">Last Verified 1 week ago</p>
                    </div>
                    <Link className="link-as-btn" aria-label={`View details for ${gym.name}`} to={urlPath}>
                        View gym
                    </Link>
                </main>
            </div>
        </section>
    );
};
