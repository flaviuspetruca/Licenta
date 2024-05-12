import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../../configs";
import { buildHttpHeaders, fetchFn } from "../../utils/http";
import { GymQueryData } from "./Gyms";
import { RouteCard } from "../Routes/RouteCard";
import { useAlert, AlertType } from "../UI/AlertProvider";
import LoadingWrapper from "../UI/LoadingWrapper";
import { GymModal } from "./GymModal";

const Gym = () => {
    const [gym, setGym] = useState<GymQueryData | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const { showAlert } = useAlert();
    const ref = useRef<{ openModal: () => void }>();

    const handleRelationRemove = async (user_id: number) => {
        if (!id) {
            showAlert({ title: "Error", description: "No gym specified", type: AlertType.ERROR });
            return;
        }
        const url = new URL(`${BACKEND_ENDPOINT}/user-gym/${id}`);
        const paramsObject = { user_id: user_id.toString() };
        url.search = new URLSearchParams(paramsObject).toString();
        const response = await fetchFn(url.toString(), buildHttpHeaders("DELETE"));
        setLoading(true);
        if (!response.ok) {
            showAlert({ title: "Error", description: "Failed to remove user from gym", type: AlertType.ERROR });
            return;
        }
        setLoading(false);
        setRefresh(!refresh);
    };

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
    }, [id, refresh, showAlert]);

    const UsersSection = () => {
        return (
            <section className="border-2 rounded-xl p-10 mt-5 w-full max-w-128">
                <div className="flex justify-between items-center">
                    <div className="px-4 sm:px-0">
                        <h3 className="text-xl font-semibold leading-7 text-gray-900">Gym User Permisions</h3>
                        <p className="mt-1 max-w-2xl text-md leading-6 text-gray-500">Username and role</p>
                    </div>
                    <button className="btn btn-info text-white" onClick={ref.current?.openModal}>
                        Add user
                    </button>
                </div>
                <div className="mt-6 border-t border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Username
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Role
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {gym?.users.map((user, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.data.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-red-600 hover:text-red-900"
                                            onClick={() => handleRelationRemove(user.id)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    };

    return (
        <>
            <GymModal ref={ref} gym_id={Number(id)} refresh={refresh} setRefresh={setRefresh} />
            <LoadingWrapper isLoading={loading} text={gym?.name}>
                <div className="flex flex-col justify-center items-center w-full">
                    <div className="hero bg-base-200 max-w-128">
                        <div className="hero-content flex-col lg:flex-row">
                            <img src="/outputs/gym.jpg" alt={`${gym?.name} climbing gym`} className="w-96"></img>
                            <div>
                                <h1 className="text-5xl font-bold">{gym?.location}</h1>
                            </div>
                            {gym?.isAdmin && (
                                <Link to={`/route-creator/${gym?.id}`} className="btn btn-primary">
                                    Add route
                                </Link>
                            )}
                        </div>
                    </div>
                    {gym?.isAdmin && <UsersSection />}
                </div>
                <section>
                    <main className="mt-10 flex flex-wrap items-center justify-center gap-x-6">
                        {gym?.routes && gym.routes.length ? (
                            gym.routes.map((route) => <RouteCard route={route} />)
                        ) : (
                            <p>Gym does not have any routes</p>
                        )}
                    </main>
                </section>
            </LoadingWrapper>
        </>
    );
};

export default Gym;
