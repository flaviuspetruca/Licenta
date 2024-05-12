import { useEffect, useState } from "react";
import { BACKEND_ENDPOINT } from "../../configs";
import { GymCard } from "./GymCard";
import { Link } from "react-router-dom";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { GymQueryData } from "./Gyms";
import LoadingWrapper from "../UI/LoadingWrapper";
import { useAlert, AlertType } from "../UI/AlertProvider";

const GymAdministrator = () => {
    const [gyms, setGyms] = useState<GymQueryData[]>([]);
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getGyms() {
            setLoading(true);
            const response = await fetchFn(`${BACKEND_ENDPOINT}/gym-admin`, buildHttpHeaders());
            setLoading(false);
            if (!response.ok) {
                setGyms([]);
                showAlert({ title: "Error", description: "Failed to retrieve gyms", type: AlertType.ERROR });
                return;
            }
            const data = await response.json();
            setGyms([...data]);
        }
        getGyms();
    }, [showAlert]);

    const renderContent = gyms.length ? (
        gyms.map((gym) => <GymCard key={"gym-" + gym.id} gym={gym} />)
    ) : (
        <section>
            <h2 className="text-2xl font-bold leading-7 mt-52 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                You do not administrate any gyms
            </h2>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                    to={"/gyms"}
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    See other gyms
                </Link>
            </div>
        </section>
    );

    return (
        <LoadingWrapper isLoading={loading} text={"Admin"}>
            <div className="gym-list">{renderContent}</div>
        </LoadingWrapper>
    );
};

export default GymAdministrator;
