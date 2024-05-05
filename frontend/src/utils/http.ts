const buildHttpHeaders = (method?: string, body?: string, content_type?: string) => {
    return {
        method: method ? method : "GET",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": content_type ? content_type : "application/json",
        },
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
