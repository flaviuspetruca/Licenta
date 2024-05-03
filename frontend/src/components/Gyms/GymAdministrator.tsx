import { useEffect, useState } from "react";
import { BACKEND_ENDPOINT } from "../../configs";
import { GymCard } from "./GymCard";
import { Link } from "react-router-dom";
import Loading from "../Loading";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { GymQueryData } from "./Gyms";

const GymAdministrator = () => {
    const [gyms, setGyms] = useState<GymQueryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getGyms() {
            try {
                setLoading(true);
                const response = await fetchFn(`${BACKEND_ENDPOINT}/gym-admin`, buildHttpHeaders());
                const data = await response.json();
                setGyms([...data]);
            } catch (error) {
                // TODO: handle error
            }
            setLoading(false);
        }
        getGyms();
    }, []);

    const renderContent = gyms.length ? (
        gyms.map((gym) => <GymCard gym={gym} />)
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
        <div className="wrapper">
            <h1 className="text-8xl font-bold leading-7 ml-10 mb-10 text-gray-900 sm:truncate sm:text-8xl sm:tracking-tight">
                Admin
            </h1>
            <div className="p-5">
                <Loading isLoading={loading}>{renderContent}</Loading>
            </div>
        </div>
    );
};

export default GymAdministrator;
