import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../../configs";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { GymQueryData } from "./Gyms";
import { useAlert, AlertType } from "../UI/AlertProvider";
import LoadingWrapper from "../UI/LoadingWrapper";
import { GymModal } from "./GymModal";
import Map from "../Maps/Map";

const GymSubmission = () => {
    const [gym, setGym] = useState<GymQueryData | null>(null);
    const [loading, setLoading] = useState(true);
    const imageRef = useRef<HTMLImageElement>(null);
    const { id } = useParams();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const ref = useRef<{ openModal: () => void }>();

    const acceptSubmission = async () => {
        if (!id) {
            showAlert({ title: "Error", description: "No gym specified", type: AlertType.ERROR });
            return;
        }
        const response = await fetchFn(`${BACKEND_ENDPOINT}/gym-submission/${id}`, buildHttpHeaders("PUT"));
        if (!response.ok) {
            showAlert({ title: "Error", description: "Failed to accept gym submission", type: AlertType.ERROR });
            return;
        }
        showAlert({ title: "Success", description: "Gym submission accepted", type: AlertType.SUCCESS });
        const data = await response.json();
        navigate(`/gym/${data.id}`);
    };

    const rejectSubmission = async () => {
        if (!id) {
            showAlert({ title: "Error", description: "No gym specified", type: AlertType.ERROR });
            return;
        }
        const response = await fetchFn(`${BACKEND_ENDPOINT}/gym-submission/${id}`, buildHttpHeaders("DELETE"));
        if (!response.ok) {
            showAlert({ title: "Error", description: "Failed to delete gym submission", type: AlertType.ERROR });
            return;
        }
        showAlert({ title: "Success", description: "Gym submission deleted", type: AlertType.SUCCESS });
        navigate("/admin");
    };

    useEffect(() => {
        async function getGym() {
            setLoading(true);
            const response = await fetchFn(`${BACKEND_ENDPOINT}/gym-submission/${id}`, buildHttpHeaders());
            setLoading(false);
            if (!response.ok) {
                setGym(null);
                showAlert({ title: "Error", description: "Failed to retrieve gym data", type: AlertType.ERROR });
                return;
            }
            const data = await response.formData();
            const gym = JSON.parse(data.get("json_data") as string);
            const thumbnail = data.get("thumbnail") as Blob;
            imageRef.current!.src = URL.createObjectURL(thumbnail);
            setGym(gym);
        }
        getGym();
    }, [id, showAlert]);

    return (
        <>
            {/* <GymModal ref={ref} gym_id={Number(id)} refresh={refresh} setRefresh={setRefresh} /> */}
            <LoadingWrapper isLoading={loading} text={gym?.name}>
                <div className="flex flex-col justify-center items-center w-full">
                    <div className="hero bg-base-200 max-w-128">
                        <div
                            className={`hero-content flex-col ${gym?.status !== "APPROVED" ? "items-start justify-between" : "items-center"} lg:flex-row w-full`}
                        >
                            <img ref={imageRef} alt={`${gym?.name} climbing gym`} className="lg:max-w-114"></img>
                            <div className="flex flex-col gap-2">
                                {gym?.status !== "APPROVED" && (
                                    <>
                                        <button onClick={acceptSubmission} className="btn btn-primary">
                                            Accept Submission
                                        </button>
                                        <button onClick={rejectSubmission} className="btn btn-error">
                                            Reject Submission
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {gym?.location && (
                        <Map
                            lat={Number(gym?.location.split(",")[0])}
                            lng={Number(gym?.location.split(",")[1])}
                            height="400px"
                            width="70rem"
                            popupText={gym?.name}
                        ></Map>
                    )}
                </div>
            </LoadingWrapper>
        </>
    );
};

export default GymSubmission;
