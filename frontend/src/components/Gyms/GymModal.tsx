import { Listbox, ListboxButton, ListboxOption, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useRef, forwardRef, useState, useImperativeHandle, Fragment, FormEvent } from "react";
import { BACKEND_ENDPOINT } from "../../configs";
import { fetchFn, buildHttpHeaders } from "../../utils/http";
import { AlertType, useAlert } from "../UI/AlertProvider";

const roles = ["ADMIN", "EDITOR"];

type Props = {
    gym_id: number;
    refresh: boolean;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

export const GymModal = forwardRef(({ gym_id, refresh, setRefresh }: Props, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [username, setUsername] = useState("");
    const [role, setRole] = useState(roles[0]);
    const { showAlert } = useAlert();

    const resetDialog = () => {
        dialogRef.current?.close();
        setUsername("");
        setRole(roles[0]);
    };

    const handleInsert = async (e: FormEvent) => {
        e.preventDefault();

        const response = await fetchFn(
            `${BACKEND_ENDPOINT}/user-gym/${gym_id}`,
            buildHttpHeaders("POST", JSON.stringify({ username, role }))
        );
        if (!response.ok) {
            const message = await response.text();
            showAlert({ title: "Error", description: message, type: AlertType.ERROR });
            return;
        }
        resetDialog();
        setRefresh(!refresh);
        showAlert({ title: "Success", description: "User added to gym", type: AlertType.SUCCESS });
    };

    useImperativeHandle(ref, () => ({
        openModal: () => {
            dialogRef.current?.showModal();
        },
    }));
    return (
        <dialog ref={dialogRef} className="modal">
            <div className="flex flex-col gap-2 modal-box">
                <h3 className="text-2xl font-bold">Add permissions</h3>
                <div className="p-5 mt-2">
                    <form onSubmit={handleInsert}>
                        <label htmlFor="username" className="input-label">
                            Username
                        </label>
                        <input
                            className="block w-full rounded-md border-0 py-1.5 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label htmlFor="permission" className="mt-2 input-label">
                            Role
                        </label>
                        <Listbox value={role} onChange={setRole}>
                            <div className="relative mt-1">
                                <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                    <span className="block truncate">{role}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </ListboxButton>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                        {roles.map((r, idx) => (
                                            <ListboxOption
                                                key={idx}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                        active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                                                    }`
                                                }
                                                value={r}
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span
                                                            className={`block truncate ${
                                                                selected ? "font-medium" : "font-normal"
                                                            }`}
                                                        >
                                                            {r}
                                                        </span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </ListboxOption>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </form>
                </div>
                <div className="modal-action">
                    <button className="btn" onClick={(e) => handleInsert(e)}>
                        Add
                    </button>
                    <form method="dialog">
                        <button onClick={resetDialog} className="btn cancel-btn">
                            Cancel
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
});
