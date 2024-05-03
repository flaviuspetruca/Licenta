import Loading from "../Loading";

type Props = {
    isLoading: boolean;
    text: string | undefined;
    children: React.ReactNode;
};

const LoadingWrapper = ({ isLoading, text, children }: Props) => {
    return (
        <div className="wrapper">
            <h1 className="text-8xl font-bold leading-7 ml-10 mb-10 text-gray-900 sm:truncate sm:text-8xl sm:tracking-tight">
                {text}
            </h1>
            <div className="p-5">
                <Loading isLoading={isLoading}>{children}</Loading>
            </div>
        </div>
    );
};

export default LoadingWrapper;
