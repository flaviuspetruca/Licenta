import { useRef, useState } from "react";
import LoadingWrapper from "../UI/LoadingWrapper";
import { BACKEND_ENDPOINT } from "../../configs";
import { buildHttpHeaders } from "../../utils/http";
import { AlertType, useAlert } from "../UI/AlertProvider";
import { useNavigate } from "react-router-dom";
import Map from "../Maps/Map";
import { LatLngExpression } from "leaflet";
import FileChooser from "../FileChooser";

const GymRegister = () => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [picture, setPicture] = useState<File | null>(null);
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const mapRef = useRef<{ markerPosition: LatLngExpression | null }>();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            if (files[0].size > 1048576) {
                showAlert({ title: "Error", description: "File size must be less than 1MB", type: AlertType.ERROR });
                e.target.value = "";
                return;
            }
            if (files[0].type.split("/")[0] !== "image") {
                showAlert({ title: "Error", description: "File must be an image", type: AlertType.ERROR });
                e.target.value = "";
                return;
            }
            setPicture(files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append("name", name);
        data.append("location", mapRef.current?.markerPosition?.toString() || "");
        data.append("file", picture as File, picture?.name);
        console.log(mapRef.current?.markerPosition?.toString());
        const response = await fetch(`${BACKEND_ENDPOINT}/gym`, buildHttpHeaders("POST", data, ""));
        if (response.ok) {
            showAlert({ title: "Success", description: "Gym registered", type: AlertType.SUCCESS });
            const data = await response.json();
            navigate(`/gym/${data.id}`);
        } else {
            showAlert({ title: "Error", description: "Failed to register gym", type: AlertType.ERROR });
        }

        setLoading(false);
    };

    return (
        <LoadingWrapper text="Register your gym" isLoading={loading}>
            <div className="flex flex-col items-center w-full">
                <form className="max-w-lg" onSubmit={handleSubmit}>
                    <div className="form-input-container">
                        <label className="input-label" htmlFor="gym-name">
                            Gym name
                        </label>
                        <input
                            className="input-class"
                            id="gym-name"
                            type="text"
                            placeholder="Gym name"
                            required
                            onChange={handleNameChange}
                        ></input>
                    </div>
                    <div className="form-input-container">
                        <label className="input-label" htmlFor="gym-location">
                            Set Location
                        </label>
                        <Map ref={mapRef}></Map>
                    </div>
                    <FileChooser
                        label="Choose gym picture"
                        onChange={handlePictureChange}
                        helpText="A meaningful picture for your gym."
                    ></FileChooser>

                    <button className="btn btn-accent mt-6" type="submit" aria-label="Submit gym registration form">
                        Register
                    </button>
                </form>
            </div>
        </LoadingWrapper>
    );
};

export default GymRegister;
