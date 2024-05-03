import { useEffect, useState } from "react";
import { BACKEND_ENDPOINT } from "../../configs";
import { GymCard } from "./GymCard";
import Loading from "../Loading";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { RouteQueryData } from "../Routes/Route";

export type GymQueryData = {
    id: number;
    name: string;
    location: string;
    users: { username: string }[];
    nr_routes?: number;
    routes?: RouteQueryData[]; //TODO: Omit the extra data
};

const Gyms = () => {
    const [loading, setLoading] = useState(true);
    const [gyms, setGyms] = useState<GymQueryData[]>([]);

    useEffect(() => {
        async function getGyms() {
            try {
                setLoading(true);
                const response = await fetchFn(`${BACKEND_ENDPOINT}/gyms`, buildHttpHeaders());
                const data = await response.json();
                setGyms([...data]);
            } catch (error) {
                // TODO: handle error
                setGyms([]);
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
                No gyms found
            </h2>
        </section>
    );

    return (
        <div className="wrapper">
            <h1 className="text-8xl font-bold leading-7 ml-10 mb-10 text-gray-900 sm:truncate sm:text-8xl sm:tracking-tight">
                Gyms
            </h1>
            <div className="p-5">
                <Loading isLoading={loading}>{renderContent}</Loading>
            </div>
        </div>
    );
};

export default Gyms;
