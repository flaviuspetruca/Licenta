import { forwardRef, useImperativeHandle, useRef } from "react";

type Props = {
    resetPanel: (() => void) | undefined;
};

const AppModal = forwardRef(({ resetPanel }: Props, ref) => {
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
                <h3 className="text-2xl font-bold mb-10">Esti sigur ca vrei sa resetezi panoul?</h3>
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn reset-btn" onClick={handleReset}>
                            Reset
                        </button>
                    </form>
                </div>
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn cancel-btn">Cancel</button>
                    </form>
                </div>
            </div>
        </dialog>
    );
});

export default AppModal;
