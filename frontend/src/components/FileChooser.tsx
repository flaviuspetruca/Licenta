type Props = {
    label: string;
    helpText?: string;
    type?: "large" | "small";
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const FileChooser = ({ label, helpText, onChange, type = "large" }: Props) => {
    const width = type === "large" ? "w-100" : "w-52";
    return (
        <div>
            <label className="input-label" htmlFor="picture">
                {label}
            </label>
            <input
                className={`block file:h-auto h-auto ${width} file:text-base file:font-semibold file:p-2 text-sm file:bg-indigo-400 file:cursor-pointer file:text-indigo-950 file:rounded-l-md file:border-0 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400`}
                aria-describedby="picture-help"
                alt="Press enter to select file"
                id="picture"
                type="file"
                required
                multiple={false}
                onChange={onChange}
            />
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="picture-help">
                {helpText || ""}
            </div>
        </div>
    );
};

export default FileChooser;
