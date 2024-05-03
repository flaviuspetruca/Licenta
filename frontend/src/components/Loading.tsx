import React from "react";
import Spinner from "./UI/Spinner";

type LoadingProps = {
    isLoading: boolean;
    children: React.ReactNode;
};

const Loading = ({ isLoading, children }: LoadingProps) => {
    return isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
            <Spinner width="w-10" />
        </div>
    ) : (
        <>{children}</>
    );
};

export default Loading;
