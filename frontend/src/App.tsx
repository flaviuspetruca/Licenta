import React, { useEffect, useState } from "react";
import "./App.scss";
import MainPanel from "./components/MainPanel";
import { useParams } from "react-router-dom";
import { BACKEND_ENDPOINT } from "./configs";
import Loading from "./components/Loading";
import { buildHttpHeaders, fetchFn } from "./utils/http";

function App() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function verifyAdmin() {
            setLoading(true);
            await fetchFn(`${BACKEND_ENDPOINT}/verify-admin/${id}`, buildHttpHeaders());
            setLoading(false);
        }
        verifyAdmin();
    }, [id]);

    return (
        <div className="App">
            <Loading isLoading={loading}>
                <MainPanel />
            </Loading>
        </div>
    );
}

export default App;
