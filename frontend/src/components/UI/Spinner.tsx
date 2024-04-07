import React from "react";

type Props = {
    variant?: "text-white" | undefined;
};

const Spinner = ({ variant }: Props) => {
    return <span className={`loading loading-spinner w-4 ${variant}`}></span>;
};

export default Spinner;
