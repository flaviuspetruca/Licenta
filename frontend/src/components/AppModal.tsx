import { forwardRef, useImperativeHandle, useRef } from "react";

type Props = {
    resetPanel: (() => void) | undefined;
    title: string;
    confirmButtonText: string;
    cancelButtonText: string;
};

const AppModal = forwardRef(({ resetPanel, title, confirmButtonText, cancelButtonText }: Props, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const handleReset = () => {
        if (resetPanel) resetPanel();
    };

    useImperativeHandle(ref, () => ({
        openModal: () => {
            dialogRef.current?.showModal();
        },
    }));

    return (
        <dialog ref={dialogRef} className="modal">
            <div className="flex justify-end gap-2 modal-box">
                <h3 className="text-2xl font-bold">{title}</h3>
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn reset-btn" onClick={handleReset}>
                            {confirmButtonText}
                        </button>
                    </form>
                </div>
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn cancel-btn">{cancelButtonText}</button>
                    </form>
                </div>
            </div>
        </dialog>
    );
});

export default AppModal;
