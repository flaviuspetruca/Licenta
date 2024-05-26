const buildHttpHeaders = (method?: string, body?: string | FormData, content_type?: string) => {
    const headers: { [key: string]: string } = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    if (content_type !== "") {
        headers["Content-Type"] = content_type || "application/json";
    }

    return {
        method: method ? method : "GET",
        headers,
        body: body ? body : undefined,
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
