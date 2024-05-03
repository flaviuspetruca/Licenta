import React from "react";

type Props = {
    variant?: "text-white" | undefined;
    width?: string;
};

const Spinner = ({ variant, width = "w-4" }: Props) => {
    return <span className={`loading loading-spinner ${width} ${variant}`}></span>;
};

export default Spinner;
