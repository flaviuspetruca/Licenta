import { ChevronUpIcon } from "@heroicons/react/24/outline";
import Spinner from "../UI/Spinner";
import { Menu, Transition, Label, Field, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import FileChooser from "../FileChooser";

type TableRouteActionsProps = {
    handleRouteNameChange: (routeName: string) => void;
    handleRouteSubmit: () => void;
    handleSetDebugRoute: () => void;
    handleRemoveDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragOver: (event: React.DragEvent<HTMLTableElement>) => void;
    handleDifficultyChange: (difficulty: string) => void;
    handlePictureChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    routeName: string;
    difficulty: string;
    openModal: (() => void) | undefined;
    processing: boolean;
    generated: boolean;
    isRouteSaved: boolean;
};

export const difficultyLevels = ["4", "4+", "5-", "5", "5+"];

const TableRouteActions = ({
    handleRouteNameChange,
    handleRouteSubmit,
    handleSetDebugRoute,
    handleRemoveDrop,
    handleDragOver,
    handleDifficultyChange,
    handlePictureChange,
    routeName,
    difficulty,
    openModal,
    processing,
    generated,
    isRouteSaved,
}: TableRouteActionsProps) => {
    const saveGroup = generated && !isRouteSaved && (
        <>
            <div className="input-container bg-light-blue">
                <label htmlFor="route-name" className="input-label text-white bg-light-green">
                    Title
                </label>
                <input
                    type="text"
                    name="route-name"
                    id="price"
                    value={routeName}
                    className="input-class"
                    onChange={(e) => handleRouteNameChange(e.target.value)}
                />
            </div>
            <Field className="input-container bg-violet-400 !text-indigo-950">
                <Label className="input-label">Difficulty</Label>
                <Menu>
                    <MenuButton className="inline-flex justify-between items-center w-full px-4 py-2 text-md font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800">
                        {difficulty}
                        <ChevronUpIcon className="size-4 fill-white/60" />
                    </MenuButton>
                    <Transition
                        enter="transition ease-out duration-75"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <MenuItems
                            className="w-52 origin-top-right rounded-xl border border-white/5 bg-black p-1 text-sm/6 text-white [--anchor-gap:var(--spacing-1)] focus:outline-none"
                            anchor="top"
                        >
                            {difficultyLevels.map((level) => (
                                <MenuItem key={level}>
                                    <button
                                        className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10"
                                        onClick={() => handleDifficultyChange(level)}
                                    >
                                        {level}
                                    </button>
                                </MenuItem>
                            ))}
                        </MenuItems>
                    </Transition>
                </Menu>
            </Field>
            <div className="input-container bg-slate-100">
                <FileChooser label="Route image" onChange={handlePictureChange} type="small" />
            </div>
        </>
    );

    return (
        <div className="flex flex-wrap justify-end items-center gap-2 bg-indigo-600 p-4 rounded-xl max-w-100">
            {saveGroup}
            {!isRouteSaved && (
                <button
                    className={`btn ${generated ? "green-btn" : "btn-primary text-white"}`}
                    onClick={handleRouteSubmit}
                >
                    {processing ? (
                        <div className="flex content-center items-center flex-row gap-2">
                            <Spinner variant="text-white" />
                            <p>Processing...</p>
                        </div>
                    ) : generated ? (
                        <p>Save</p>
                    ) : (
                        <p>Generate</p>
                    )}
                </button>
            )}
            {/* <button className="btn interactable-container text-red-500 font-bold" onClick={handleSetDebugRoute}>
                DEBUG
            </button> */}
            <div
                className="btn interactable-container flex justify-center"
                onDrop={handleRemoveDrop}
                onDragOver={handleDragOver}
                onClick={openModal}
                draggable={false}
            >
                <img draggable={false} className="trash-img" src="/trash.svg" alt="trash"></img>
            </div>
        </div>
    );
};

export default TableRouteActions;
