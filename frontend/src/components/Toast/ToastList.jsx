import { createPortal } from "react-dom";
import Toast from "./Toast";

import { useToast } from "../../contexts/ToastContext";

import "./Toast.css";

const ToastList = () => {
    const { toastList, removeToast } = useToast();

    return createPortal(
        <div className="toast-list">
            {toastList.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>,
        document.body
    )
}

export default ToastList;