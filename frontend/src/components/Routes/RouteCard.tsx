import { Link } from "react-router-dom";
import { RouteQueryData } from "./Route";

export const RouteCard = ({ route }: { route: RouteQueryData }) => {
    return (
        <section className="lg:flex mb-5">
            <div
                className=" h-72 lg:h-auto lg:w-72 flex-none bg-cover rounded-t-xl lg:rounded-t-none lg:rounded-l-xl text-center overflow-hidden"
                title={route.name}
            >
                <img src="/outputs/route.jpg" alt={`${route.name} climbing route`} className="w-full h-full"></img>
            </div>
            <div className="rounded-b-xl lg:rounded-b-none lg:rounded-r-xl border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white p-6 flex flex-col justify-between leading-normal">
                <header>
                    <h1 className="text-gray-900 font-bold text-3xl mb-2">{route.name}</h1>
                    <p className="text-gray-700 text-lg">Difficulty: </p>
                </header>
                <Link to={`/gym/${route.id}`} className="flex items-center justify-between mb-8">
                    Gym: {route.gym.name}
                </Link>
                <main className="flex items-center justify-between">
                    <div className="text-md">
                        <p className="text-gray-900 leading-none">Created by: {route.user.username}</p>
                        <p className="text-gray-600">Last Verified 1 week ago</p>
                    </div>
                    <Link className="link-as-btn" to={`/route/${route.id}`}>
                        Click to view route
                    </Link>
                </main>
            </div>
        </section>
    );
};
