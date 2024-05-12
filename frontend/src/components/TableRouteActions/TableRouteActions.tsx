import { ChevronUpIcon } from "@heroicons/react/24/outline";
import Spinner from "../UI/Spinner";
import { Menu, Transition, Label, Field, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

type TableRouteActionsProps = {
    handleRouteNameChange: (routeName: string) => void;
    handleRouteSubmit: () => void;
    handleSetDebugRoute: () => void;
    handleRemoveDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragOver: (event: React.DragEvent<HTMLTableElement>) => void;
    handleDifficultyChange: (difficulty: string) => void;
    routeName: string;
    difficulty: string;
    openModal: (() => void) | undefined;
    processing: boolean;
    generated: boolean;
};

export const difficultyLevels = ["1c", "2a", "2b", "2c", "3a", "3b", "3c", "4a", "4b", "4c", "5a", "5b", "5c"];

const TableRouteActions = ({
    handleRouteNameChange,
    handleRouteSubmit,
    handleSetDebugRoute,
    handleRemoveDrop,
    handleDragOver,
    handleDifficultyChange,
    routeName,
    difficulty,
    openModal,
    processing,
    generated,
}: TableRouteActionsProps) => (
    <div className="flex flex-wrap justify-end gap-2 max-w-100 bg-indigo-500 p-4 rounded-xl">
        {generated && (
            <>
                <div>
                    <label htmlFor="route-name" className="!text-white input-label">
                        Route Name
                    </label>
                    <input
                        type="text"
                        name="route-name"
                        id="price"
                        value={routeName}
                        className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        onChange={(e) => handleRouteNameChange(e.target.value)}
                    />
                </div>
                <Field>
                    <Label className="!text-white input-label">Difficulty</Label>
                    <Menu>
                        <MenuButton className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800">
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
            </>
        )}
        <button className={`btn ${generated ? "green-btn" : "btn-primary text-white"}`} onClick={handleRouteSubmit}>
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
        <button className="btb interactable-container text-red-500 font-bold" onClick={handleSetDebugRoute}>
            DEBUG
        </button>
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

export default TableRouteActions;
