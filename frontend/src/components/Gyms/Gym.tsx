import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../../configs";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { GymQueryData } from "./Gyms";
import { RouteCard } from "../Routes/RouteCard";
import { useAlert, AlertType } from "../UI/AlertProvider";
import LoadingWrapper from "../UI/LoadingWrapper";

const Gym = () => {
    const [gym, setGym] = useState<GymQueryData | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const { showAlert } = useAlert();

    useEffect(() => {
        async function getGym() {
            setLoading(true);
            const response = await fetchFn(`${BACKEND_ENDPOINT}/gym/${id}`, buildHttpHeaders());
            const data = await response.json();
            setLoading(false);
            if (!response.ok) {
                setGym(null);
                showAlert({ title: "Error", description: "Failed to retrieve gym data", type: AlertType.ERROR });
                return;
            }
            setGym(data);
        }
        getGym();
    }, [id, showAlert]);

    return (
        <LoadingWrapper isLoading={loading} text={gym?.name}>
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
        </LoadingWrapper>
    );
};

export default Gym;
