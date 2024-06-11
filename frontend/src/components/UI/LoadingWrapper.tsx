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
                <header>
                    <h1 className="xs:text-6xl text-5xl font-bold leading-7 pl-10 pb-10 text-gray-900 sm:truncate lg:text-8xl sm:tracking-tight w-full">
                        {text}
                    </h1>
                </header>
                <main className={`p-5 flex flex-row flex-wrap ${contentStyle}`} aria-live="polite">
                    <Loading isLoading={isLoading}>{children}</Loading>
                </main>
            </div>
        </div>
    );
};

export default LoadingWrapper;
