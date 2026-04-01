import { useEffect, useRef, useState } from "react";
import { useAuth } from "@contexts/AuthContext.jsx";
import { useToast } from "@contexts/ToastContext.jsx";
import { fetchWithAuth } from "@utils/fetchWithAuth.jsx";
import Input from "@components/Input/Input.js";
import Button from "@components/Button/Button.js";

type ServerEmoji = {
    emoji_id: string;
    name: string;
    image_url: string | null;
    unicode: string | null;
    is_custom: 0 | 1;
};

type ServerEmojiManagerProps = {
    serverId: string | undefined;
};

const ServerEmojiManager: React.FC<ServerEmojiManagerProps> = ({ serverId }) => {
    const authContext = useAuth();
    const { addToast } = useToast();

    const [emojis, setEmojis] = useState<ServerEmoji[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [emojiName, setEmojiName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchServerEmojis = async () => {
        if (!serverId) {
            setEmojis([]);
            return;
        }

        try {
            setIsLoading(true);
            const res = await fetchWithAuth(
                authContext,
                `${import.meta.env.VITE_API_URL}/api/servers/${serverId}/emojis`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authContext?.accessToken}`,
                    },
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.message || "Failed to fetch server emojis");
            }

            const data = await res.json();
            setEmojis(Array.isArray(data.emojis) ? data.emojis : []);
        } catch (error) {
            console.error("Error loading server emojis", error);
            addToast("error", error instanceof Error ? error.message : "Failed to load server emojis");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServerEmojis();
    }, [serverId]);

    const handleUploadEmoji = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        if (!serverId || typeof serverId !== "string") {
            addToast("error", "Invalid server id");
            event.target.value = "";
            return;
        }

        const normalizedEmojiName = emojiName.trim().toLowerCase().replace(/\s+/g, "-");
        if (!normalizedEmojiName) {
            addToast("error", "Emoji name is required before upload");
            event.target.value = "";
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("emoji", selectedFile);
            formData.append("name", normalizedEmojiName);

            const res = await fetchWithAuth(
                authContext,
                `${import.meta.env.VITE_API_URL}/api/servers/${serverId}/emojis`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${authContext?.accessToken}`,
                    },
                    body: formData,
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.message || "Failed to upload emoji");
            }

            setEmojiName("");
            addToast("success", "Emoji uploaded");
            await fetchServerEmojis();
        } catch (error) {
            console.error("Error uploading emoji", error);
            addToast("error", error instanceof Error ? error.message : "Failed to upload emoji");
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    };

    const handleDeleteEmoji = async (emojiId: string) => {
        if (!serverId) {
            addToast("error", "Invalid server id");
            return;
        }

        if (!confirm("Are you sure you want to delete this emoji? It can affect your server chat reactions.")) {
            return;
        }

        try {
            setDeletingId(emojiId);
            const res = await fetchWithAuth(
                authContext,
                `${import.meta.env.VITE_API_URL}/api/servers/${serverId}/emojis/${emojiId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${authContext?.accessToken}`,
                    },
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.message || "Failed to delete emoji");
            }

            addToast("success", "Emoji deleted");
            await fetchServerEmojis();
        } catch (error) {
            console.error("Error deleting emoji", error);
            addToast("error", error instanceof Error ? error.message : "Failed to delete emoji");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section className="rounded-xl border border-[var(--color-primary)] bg-[color:color-mix(in_oklab,var(--color-secondary)_82%,transparent)] p-4">
            <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[220px] flex-1">
                    <label className="text-sm text-[var(--color-text-secondary)]">New emoji name</label>
                    <Input
                        type="text"
                        value={emojiName}
                        onChange={(event) => setEmojiName(event.target.value)}
                        className="mt-1 w-full rounded-md border border-[var(--color-primary)] bg-transparent px-3 py-2 text-[var(--color-text-primary)]"
                        placeholder="for example: party-pepe"
                    />
                </div>

                <Button
                    title={isUploading ? "Uploading..." : "Choose emoji image"}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || !emojiName.trim()}
                    width="180px"
                    height="42px"
                    color="var(--color-text-primary)"
                    backgroundColor="var(--color-primary)"
                />

                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadEmoji}
                    className="hidden"
                    containerClassName="hidden"
                    disabled={isUploading}
                />
            </div>

            <div className="mt-4">
                <h3 className="text-[1rem] font-semibold text-[var(--color-text-secondary)]">Server Emojis</h3>
                {isLoading ? (
                    <p className="mt-2 text-sm text-[var(--color-text-primary)] opacity-80">Loading emojis...</p>
                ) : emojis.length === 0 ? (
                    <p className="mt-2 text-sm text-[var(--color-text-primary)] opacity-80">No emojis yet</p>
                ) : (
                    <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(98px,1fr))] gap-2">
                        {emojis.map((emoji) => (
                            <div
                                key={emoji.emoji_id}
                                className="group relative rounded-lg border border-[color:color-mix(in_oklab,var(--color-text-primary)_20%,transparent)] bg-[color:color-mix(in_oklab,var(--color-secondary)_86%,transparent)] p-2"
                            >
                                <button
                                    onClick={() => handleDeleteEmoji(emoji.emoji_id)}
                                    disabled={deletingId === emoji.emoji_id}
                                    className="absolute -right-2 -top-2 hidden rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-50 group-hover:flex"
                                    title="Delete emoji"
                                    aria-label="Delete emoji"
                                >
                                    {deletingId === emoji.emoji_id ? (
                                        <span className="h-4 w-4 animate-spin">⌛</span>
                                    ) : (
                                        <span className="text-sm">✕</span>
                                    )}
                                </button>
                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-black/20">
                                    {emoji.image_url ? (
                                        <img src={emoji.image_url} alt={emoji.name} className="h-9 w-9 object-contain" />
                                    ) : (
                                        <span className="text-lg">{emoji.unicode || "🙂"}</span>
                                    )}
                                </div>
                                <p className="mt-2 truncate text-xs text-[var(--color-text-primary)]">:{emoji.name}:</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ServerEmojiManager;
