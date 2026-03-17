import { useEffect, useState } from "react";
import { useAuth } from "@contexts/AuthContext.jsx";
import { useToast } from "@contexts/ToastContext.jsx";
import { fetchWithAuth } from "@utils/fetchWithAuth.jsx";
import Input from "@components/Input/Input.js";

type ServerNameEditorProps = {
    serverId: string | undefined;
    serverName: string;
    onServerNameUpdated: (newServerName: string) => void;
};

const ServerNameEditor: React.FC<ServerNameEditorProps> = ({
    serverId,
    serverName,
    onServerNameUpdated,
}) => {
    const authContext = useAuth();
    const { accessToken } = authContext;
    const { addToast } = useToast();

    const [serverNameInput, setServerNameInput] = useState(serverName);
    const [isEditingServerName, setIsEditingServerName] = useState(false);
    const [isUpdatingServerName, setIsUpdatingServerName] = useState(false);

    useEffect(() => {
        if (!isEditingServerName) {
            setServerNameInput(serverName);
        }
    }, [serverName, isEditingServerName]);

    const handleEditServerNameClick = () => {
        setServerNameInput(serverName);
        setIsEditingServerName(true);
    };

    const handleCancelServerNameEdit = () => {
        setServerNameInput(serverName);
        setIsEditingServerName(false);
    };

    const handleSaveServerName = async () => {
        const trimmedServerName = serverNameInput.trim();

        if (!serverId || typeof serverId !== "string") {
            addToast("error", "Invalid server id.");
            return;
        }

        if (!trimmedServerName) {
            addToast("error", "Server name cannot be empty.");
            return;
        }

        if (trimmedServerName === serverName) {
            setIsEditingServerName(false);
            return;
        }

        try {
            setIsUpdatingServerName(true);

            const res = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/servers/${serverId}/name`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    serverName: trimmedServerName,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.message || "Failed to update server name.");
            }

            onServerNameUpdated(trimmedServerName);
            setIsEditingServerName(false);
            addToast("success", "Server name updated successfully.");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update server name.";
            addToast("error", errorMessage);
        } finally {
            setIsUpdatingServerName(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            {isEditingServerName ? (
                <Input
                    type="text"
                    value={serverNameInput}
                    maxLength={255}
                    onChange={(event) => setServerNameInput(event.target.value)}
                    className="rounded-md border border-[var(--color-primary)] bg-transparent px-3 py-2 text-xl font-semibold text-[var(--color-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    disabled={isUpdatingServerName}
                />
            ) : (
                <h2 className="profile-username text-[var(--color-text-secondary)]">{serverName || "Server Name"}</h2>
            )}

            {isEditingServerName ? (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSaveServerName}
                        disabled={isUpdatingServerName}
                        className="rounded-md bg-[var(--color-primary)] px-3 py-1 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isUpdatingServerName ? "Saving..." : "Save"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelServerNameEdit}
                        disabled={isUpdatingServerName}
                        className="rounded-md border border-[var(--color-primary)] px-3 py-1 text-sm font-semibold text-[var(--color-primary)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleEditServerNameClick}
                    className="rounded-md border border-[var(--color-primary)] px-3 py-1 text-sm font-semibold text-[var(--color-primary)] transition-opacity hover:opacity-90"
                >
                    Edit Name
                </button>
            )}
        </div>
    );
};

export default ServerNameEditor;
