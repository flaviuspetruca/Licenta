import { useEffect, useState } from "react";
import { BACKEND_ENDPOINT } from "../../configs";
import { RouteQueryData } from "./Route";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { RouteCard } from "./RouteCard";
import { useAlert, AlertType } from "../UI/AlertProvider";
import LoadingWrapper from "../UI/LoadingWrapper";

const Routes = () => {
    const [data, setData] = useState<RouteQueryData[]>([]);
    const [loading, setLoading] = useState(true);
    const { showAlert } = useAlert();

    useEffect(() => {
        async function getGyms() {
            setLoading(true);
            const response = await fetchFn(`${BACKEND_ENDPOINT}/routes`, buildHttpHeaders());
            setLoading(false);
            if (!response.ok) {
                setData([]);
                showAlert({ title: "Error", description: "Failed to retrieve routes", type: AlertType.ERROR });
                return;
            }
            const data = await response.json();
            setData([...data]);
        }
        getGyms();
    }, [showAlert]);

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
        <LoadingWrapper isLoading={loading} text={"All routes"}>
            <div className="flex flex-wrap align-center gap-5">{renderContent}</div>
        </LoadingWrapper>
    );
};

export default Routes;
