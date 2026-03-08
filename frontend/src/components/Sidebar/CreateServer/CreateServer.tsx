import { useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import Button from "../../Button/Button.js";
import { useAuth } from "../../../contexts/AuthContext.js";
import { useToast } from "../../../contexts/ToastContext.js";
import { fetchWithAuth } from "../../../utils/fetchWithAuth.jsx";
import { redirect, useNavigate } from "react-router";

interface CreateServerProps {
    setIsCreateServerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateServerFormData {
    serverName: string;
    description: string;
}

const CreateServer = (props: CreateServerProps) => {
    const [formData, setFormData] = useState<CreateServerFormData>({ serverName: "", description: ""});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const authContext = useAuth();
    const { addToast } = useToast();

    const handleCloseCreateServerClicked = (e: MouseEvent<SVGSVGElement>) => {
        e.preventDefault();
        props.setIsCreateServerOpen(false);
    };

    const handleInputChanged = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const redirect = useNavigate();
    const handleCreateServerSubmitted = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.serverName.trim()) {
            addToast("error", "Server name is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/servers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authContext?.accessToken}`,
                },
                body: JSON.stringify({
                    serverName: formData.serverName.trim(),
                    description: formData.description.trim(),
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.message || "Failed to create server");
            }

            addToast("info", "Server created successfully.");
            props.setIsCreateServerOpen(false);
            redirect("/");
        } catch (err) {
            console.error("Create server error:", err);
            addToast("error", "Failed to create server. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed z-10">
            <div className="fixed top-0 left-0 w-full h-full bg-black-1 backdrop-blur-sm"></div>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-[var(--color-secondary)] rounded-lg flex justify-center items-center">
                <form className="flex flex-col justify-center items-center w-full h-full m-5" onSubmit={handleCreateServerSubmitted}>
                    <div className="w-full flex justify-between items-center mb-5">
                        <h1 className="text-2xl text-[var(--color-text-primary)]">Create Server</h1>
                        <svg onClick={handleCloseCreateServerClicked} xmlns="http://www.w3.org/2000/svg" width="1.5em" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M504.6 148.5C515.9 134.9 514.1 114.7 500.5 103.4C486.9 92.1 466.7 93.9 455.4 107.5L320 270L184.6 107.5C173.3 93.9 153.1 92.1 139.5 103.4C125.9 114.7 124.1 134.9 135.4 148.5L278.3 320L135.4 491.5C124.1 505.1 125.9 525.3 139.5 536.6C153.1 547.9 173.3 546.1 184.6 532.5L320 370L455.4 532.5C466.7 546.1 486.9 547.9 500.5 536.6C514.1 525.3 515.9 505.1 504.6 491.5L361.7 320L504.6 148.5z"/></svg>
                    </div>
                    <div className="w-full">
                        <label htmlFor="server-name" className="block">Server Name</label>
                        <input
                            type="text"
                            name="serverName"
                            id="server-name"
                            onChange={handleInputChanged}
                            className="m-0 mt-1 block w-full rounded-md border-[var(--color-text-secondary)] shadow-sm sm:text-sm hover:cursor-text"
                            placeholder="Enter server name"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="w-full mt-2">
                        <label htmlFor="server-description" className="block">Description</label>
                        <input
                            type="text"
                            name="description"
                            id="server-description"
                            onChange={handleInputChanged}
                            className="m-0 mt-1 block w-full rounded-md border-[var(--color-text-secondary)] shadow-sm sm:text-sm hover:cursor-text"
                            placeholder="Enter server description (optional)"
                            disabled={isSubmitting}
                        />
                    </div>


                    <div className="mt-4 w-full">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                            title={isSubmitting ? "Creating..." : "Create Server"}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateServer;