const buildHttpHeaders = () => {
    return {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };
};
const fetchFn = async (input: RequestInfo | URL, init?: RequestInit | undefined) => {
    try {
        const resp = await fetch(input, init);
        if (!resp.url.endsWith("/login") && !resp.url.endsWith("/register") && resp.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        } else if (resp.status === 404) {
            window.location.href = "/404";
        } else if (resp.status === 403) {
            window.location.href = "/gym-admin";
        }
        return resp;
    } catch (error) {
        console.error(error);
        return Response.error();
    }
};

export { buildHttpHeaders, fetchFn };
