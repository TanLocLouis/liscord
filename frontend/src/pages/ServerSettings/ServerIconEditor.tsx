import { useRef, useState } from "react";
import { useAuth } from "@contexts/AuthContext.jsx";
import { useToast } from "@contexts/ToastContext.jsx";
import { fetchWithAuth } from "@utils/fetchWithAuth.jsx";
import Input from "@components/Input/Input.js";

type ServerIconEditorProps = {
    serverId: string | undefined;
    iconUrl: string | null;
    onServerIconUpdated: (newIconUrl: string) => void;
};

const ServerIconEditor: React.FC<ServerIconEditorProps> = ({
    serverId,
    iconUrl,
    onServerIconUpdated,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const authContext = useAuth();
    const { accessToken } = authContext;
    const { addToast } = useToast();

    const handleAvatarClick = () => {
        if (isUploading) {
            return;
        }

        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        if (!serverId || typeof serverId !== "string") {
            addToast("error", "Invalid server id.");
            event.target.value = "";
            return;
        }

        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append("icon", selectedFile);

            const res = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/servers/${serverId}/icon`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.message || "Failed to update server icon.");
            }

            const localPreviewUrl = URL.createObjectURL(selectedFile);
            onServerIconUpdated(localPreviewUrl);
            addToast("success", "Server icon updated successfully.");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update server icon.";
            addToast("error", errorMessage);
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    };

    return (
        <>
            <div
                onClick={handleAvatarClick}
                className="group relative flex h-[150px] w-[150px] cursor-pointer items-center justify-center rounded-2xl border-[3px] border-[var(--color-primary)] shadow-[0_2px_10px_var(--color-primary)] transition-all hover:opacity-80"
            >
                {iconUrl ? (
                    <img
                        className="h-full w-full rounded-2xl object-cover"
                        src={iconUrl}
                        alt="Server Icon"
                    />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="100px" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/></svg>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black bg-opacity-0 transition-all group-hover:bg-opacity-50">
                    <span className="text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {isUploading ? "Uploading..." : "Change Picture"}
                    </span>
                </div>
            </div>

            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                containerClassName="hidden"
                disabled={isUploading}
            />
        </>
    );
};

export default ServerIconEditor;
