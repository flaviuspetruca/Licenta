import Loading from "../Loading";

type Props = {
    isLoading: boolean;
    text: string | undefined;
    children: React.ReactNode;
    contentStyle?: string;
};

const LoadingWrapper = ({ isLoading, text, children, contentStyle }: Props) => {
    return (
        <div className="wrapper">
            <div className="wrapper-content">
                <h1 className="xs:text-6xl text-5xl font-bold leading-7 pl-10 pb-10 text-gray-900 sm:truncate lg:text-8xl sm:tracking-tight w-full">
                    {text}
                </h1>
                <div className={`p-5 flex flex-row flex-wrap h-full ${contentStyle}`}>
                    <Loading isLoading={isLoading}>{children}</Loading>
                </div>
            </div>
        </div>
    );
};

export default LoadingWrapper;
