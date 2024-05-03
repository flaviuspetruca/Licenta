import { useEffect, useState } from "react";
import { BACKEND_ENDPOINT } from "../../configs";
import Loading from "../Loading";
import { RouteQueryData } from "./Route";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { RouteCard } from "./RouteCard";

const Routes = () => {
    const [data, setData] = useState<RouteQueryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getGyms() {
            try {
                setLoading(true);
                const response = await fetchFn(`${BACKEND_ENDPOINT}/routes`, buildHttpHeaders());
                const data = await response.json();
                setData([...data]);
            } catch (error) {
                // TODO: handle error
                setData([]);
            }
            setLoading(false);
        }
        getGyms();
    }, []);

    const renderContent = data.length ? (
        data.map((data) => <RouteCard route={data} />)
    ) : (
        <section>
            <h2 className="text-2xl font-bold leading-7 mt-52 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                No routes found
            </h2>
        </section>
    );
    return (
        <div className="wrapper">
            <h1 className="text-8xl font-bold leading-7 ml-10 mb-10 text-gray-900 sm:truncate sm:text-8xl sm:tracking-tight">
                All Routes
            </h1>
            <div className="p-5">
                <Loading isLoading={loading}>{renderContent}</Loading>
            </div>
        </div>
    );
};

export default Routes;
