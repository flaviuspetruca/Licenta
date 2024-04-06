import { forwardRef, useImperativeHandle, useState } from "react";
import Modal from "react-modal";

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
    },
};

Modal.setAppElement("#root");

type Props = {
    resetPanel: (() => void) | undefined;
};

const AppModal = forwardRef(({ resetPanel }: Props, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const closeModal = () => {
        setIsOpen(false);
    };

    const handleReset = () => {
        if (resetPanel) resetPanel();
        closeModal();
    };

    useImperativeHandle(ref, () => ({
        openModal: () => setIsOpen(true),
    }));

    return (
        <Modal isOpen={isOpen} onRequestClose={closeModal} style={customStyles} contentLabel="Confirm reset route">
            <h2 className="text-4xl font-bold mb-10">Esti sigur ca vrei sa resetezi panoul?</h2>
            <div className="flex justify-end gap-5">
                <button className="reset-btn" onClick={handleReset}>
                    Reset
                </button>
                <button className="cancel-btn" onClick={closeModal}>
                    Cancel
                </button>
            </div>
        </Modal>
    );
});

export default AppModal;
