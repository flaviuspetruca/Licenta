import { useEffect, useState } from "react";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { BACKEND_ENDPOINT } from "../../configs";
import { AlertType, useAlert } from "../UI/AlertProvider";
import { GymQueryData } from "../Gyms/Gyms";
import LoadingWrapper from "../UI/LoadingWrapper";
import { GymCard } from "../Gyms/GymCard";
import Pagination from "../UI/Pagination";

const AdminPanel = () => {
    const { showAlert } = useAlert();
    const [gymSubmissions, setGymSubmissions] = useState<GymQueryData[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function getGymSubmissions() {
            setLoading(true);
            const response = await fetchFn(`${BACKEND_ENDPOINT}/gym-submissions`, buildHttpHeaders());
            setLoading(false);
            if (!response.ok) {
                showAlert({ title: "Error", description: "Failed to get gym submissions", type: AlertType.ERROR });
                return;
            }
            const data = await response.formData();
            const gyms = JSON.parse(data.get("json_data") as string);
            const thumbnails = data.getAll("thumbnail") as Blob[];
            const queryData = gyms.map((gym: GymQueryData, index: number) => {
                gym.thumbnail = thumbnails[index];
                return gym;
            });
            setGymSubmissions([...queryData]);
        }

        getGymSubmissions();
    }, [showAlert]);

    const submissionContent = gymSubmissions.length ? (
        <Pagination>
            {gymSubmissions.map((gym) => (
                <GymCard gym={gym} type="submission" />
            ))}
        </Pagination>
    ) : (
        <section>
            <h2 className="text-2xl font-bold leading-7 mt-52 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                No gym submissions found
            </h2>
        </section>
    );
    return (
        <LoadingWrapper isLoading={loading} text="Admin Panel">
            {submissionContent}
        </LoadingWrapper>
    );
};

export default AdminPanel;
