import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../../configs";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { GymQueryData } from "./Gyms";
import { RouteCard } from "../Routes/RouteCard";

const Gym = () => {
    const [gym, setGym] = useState<GymQueryData | null>(null);
    const { id } = useParams();

    useEffect(() => {
        async function getGym() {
            try {
                const response = await fetchFn(`${BACKEND_ENDPOINT}/gym/${id}`, buildHttpHeaders());
                const data = await response.json();
                if (response.ok) {
                    console.log(data);
                    setGym(data);
                }
            } catch (error) {
                // TODO: handle error
                console.error(error);
            }
        }
        getGym();
    }, [id]);

    return (
        <div className="wrapper">
            <h1 className="text-8xl font-bold leading-7 ml-10 mb-10 text-gray-900 sm:truncate sm:text-8xl sm:tracking-tight">
                {gym?.name}
            </h1>
            <div className="p-5">
                <section>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <p>{gym?.location}</p>
                    </div>
                    <main className="mt-10 flex items-center justify-center gap-x-6">
                        {gym?.routes && gym.routes.length ? (
                            <RouteCard route={gym.routes[0]} />
                        ) : (
                            <p>Gym does not have any routes</p>
                        )}
                    </main>
                </section>
            </div>
        </div>
    );
};

export default Gym;
