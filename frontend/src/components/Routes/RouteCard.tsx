import { Link } from "react-router-dom";
import { RouteQueryData } from "./Route";

export const RouteCard = ({ route }: { route: RouteQueryData }) => {
    return (
        <section className="lg:flex mb-5">
            <div className="card-image" title={route.name}>
                <img src="/outputs/route.jpg" alt={`${route.name} climbing route`} className="w-full h-full"></img>
            </div>
            <div className="card-body">
                <header>
                    <h1 className="text-gray-900 font-bold text-3xl mb-2">{route.name}</h1>
                    <p className="text-gray-700 text-lg">Difficulty: {route.difficulty}</p>
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
