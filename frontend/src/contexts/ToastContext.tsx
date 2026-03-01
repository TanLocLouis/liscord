import { useState, createContext, useContext } from "react";

interface ToastContextType {
    toastList: Array<any>;
    addToast: (type: string, message: string) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toastList, setToastList] = useState<Array<any>>([]);

    const addToast = (type = "info", message: string) => {
        const id = Date.now() + message;

        const existedMessage = toastList.find((toast) => toast.message === message);
        if (existedMessage) return;

        setToastList((prevList) => [
            ...prevList,
            { id, message, type, duration: 5000 },
        ]);
    }

    const removeToast = (id: number) => {
        setToastList((prevList) => prevList.filter((toast) => toast.id !== id));
    }

    const value = {
        toastList,
        addToast,
        removeToast
    }

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    )
}

const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

export { ToastProvider, useToast };