import { useEffect, useState } from "react";
import { BACKEND_ENDPOINT } from "../../configs";
import { GymCard } from "./GymCard";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { RouteQueryData } from "../Routes/Route";
import LoadingWrapper from "../UI/LoadingWrapper";
import { useAlert, AlertType } from "../UI/AlertProvider";

export type UserGymRole = "ADMIN" | "EDITOR" | "VIEWER";

export type GymQueryData = {
    id: number;
    name: string;
    location: string;
    users: { id: number; username: string; data: { role: UserGymRole } }[];
    nr_routes?: number;
    routes?: RouteQueryData[]; //TODO: Omit the extra data
    isAdmin?: boolean;
};

const Gyms = () => {
    const [loading, setLoading] = useState(true);
    const { showAlert } = useAlert();
    const [gyms, setGyms] = useState<GymQueryData[]>([]);

    useEffect(() => {
        async function getGyms() {
            setLoading(true);
            const response = await fetchFn(`${BACKEND_ENDPOINT}/gyms`, buildHttpHeaders());
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
        gyms.map((gym) => <GymCard gym={gym} />)
    ) : (
        <section>
            <h2 className="text-2xl font-bold leading-7 mt-52 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                No gyms found
            </h2>
        </section>
    );

    return (
        <LoadingWrapper isLoading={loading} text={"Gyms"}>
            {renderContent}
        </LoadingWrapper>
    );
};

export default Gyms;
