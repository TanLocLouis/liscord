import { useParams } from "react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import ServerNameEditor from "./ServerNameEditor.js";
import ServerIconEditor from "./ServerIconEditor.js";
import ServerEmojiManager from "./ServerEmojiManager.js";
import { fetchWithAuth } from "@utils/fetchWithAuth.jsx";
import  { useAuth } from "@contexts/AuthContext.jsx";

type ServerSettingsTab = "general" | "emoji";

const ServerSettings: React.FC = () => {
    const { serverId } = useParams();
    const [activeTab, setActiveTab] = useState<ServerSettingsTab>("general");

    const [serverData, setServerData] = useState({
        server_name: "Example Server",
        description: "This is an example server description.",
        member_count: 42,
        created_at: "2023-01-01T00:00:00Z",
        icon: null as string | null,
    });

    const authContext = useAuth();

    useEffect(() => {
        const fetchServerData = async () => {
            try {
                const res = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/servers/${serverId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authContext?.accessToken}`,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData?.message || "Failed to create server");
                }

                const data = await res.json();
                setServerData({
                    server_name: data.server.server_name,
                    created_at: data.server.created_at,
                    icon: data.server.server_icon ?? null,
                    description: data.server.description,
                    member_count: data.server.members_count,
                });
            } catch (err) {
                console.error("Create server error: ", err);
            } finally {
            }
        }

        fetchServerData();
    }, [serverId]);

    const convertToDateString = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleDateString();
    }

    const settingsTabs: { key: ServerSettingsTab; label: string; description: string }[] = [
        {
            key: "general",
            label: "General",
            description: "Server basics and details",
        },
        {
            key: "emoji",
            label: "Emoji",
            description: "Upload and manage custom emojis",
        },
    ];

    return (
        <motion.div
            initial={{ transform: 'translateY(5%)', opacity: 0 }}
            animate={{ transform: 'translateY(0)', opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <div className="profile-top-section">
                <div className="h-[250px] w-full rounded-lg bg-[radial-gradient(circle_at_10%_50%,rgba(133,132,212,0.432)_10%,transparent_30%)]">
                    <div className="relative ml-[30px] top-20 flex items-center gap-4">
                        <ServerIconEditor
                            serverId={serverId}
                            iconUrl={serverData.icon}
                            onServerIconUpdated={(newIconUrl: string) => {
                                setServerData((prev) => ({
                                    ...prev,
                                    icon: newIconUrl,
                                }));
                            }}
                        />

                        <div className="profile-info">
                            <div className="border border-[var(--color-primary)] rounded-md p-3 mt-2 bg-[var(--color-secondary)]">
                                <ServerNameEditor
                                    serverId={serverId}
                                    serverName={serverData.server_name}
                                    onServerNameUpdated={(newServerName: string) => {
                                        setServerData((prev) => ({
                                            ...prev,
                                            server_name: newServerName,
                                        }));
                                    }}
                                />
                                {/* {serverData.description && (
                                    <p className="profile-description">{serverData.description}</p>
                                )} */}
                                {serverData.member_count !== undefined && (
                                    <p className="profile-memberCount">👥 {serverData.member_count} members</p>
                                )}
                            </div>
                            <div className="mt-2">
                                <p className="profile-createdAt">📆 {serverData.created_at ? convertToDateString(serverData.created_at) : "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] mx-2">
                <aside className="h-fit rounded-xl border border-[var(--color-primary)] bg-[color:color-mix(in_oklab,var(--color-secondary)_82%,transparent)] p-3">
                    <p className="px-1 pb-3 text-sm font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">
                        Server Settings
                    </p>

                    <nav className="flex flex-col gap-2">
                        {settingsTabs.map((tab) => {
                            const isActive = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`rounded-lg border px-3 py-2 text-left transition-all ${
                                        isActive
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/25"
                                            : "border-transparent bg-black/10 hover:border-[var(--color-primary)]/70"
                                    }`}
                                >
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{tab.label}</p>
                                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{tab.description}</p>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Tab Content */}
                <section>
                    {activeTab === "general" && (
                        <div className="rounded-xl border border-[var(--color-primary)] bg-[color:color-mix(in_oklab,var(--color-secondary)_82%,transparent)] p-4">
                            <h3 className="text-[1rem] font-semibold text-[var(--color-text-secondary)]">General Overview</h3>
                            <div className="mt-3 space-y-2 text-sm text-[var(--color-text-primary)]">
                                <p>
                                    <span className="font-semibold">Server name:</span> {serverData.server_name || "N/A"}
                                </p>
                                <p>
                                    <span className="font-semibold">Description:</span> {serverData.description || "No description"}
                                </p>
                                <p>
                                    <span className="font-semibold">Members:</span> {serverData.member_count ?? "N/A"}
                                </p>
                                <p>
                                    <span className="font-semibold">Created:</span>{" "}
                                    {serverData.created_at ? convertToDateString(serverData.created_at) : "N/A"}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "emoji" && <ServerEmojiManager serverId={serverId} />}
                </section>
            </div>
        </motion.div>
    )
}

export default ServerSettings;