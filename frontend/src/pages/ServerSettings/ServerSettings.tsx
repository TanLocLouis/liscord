import { useParams } from "react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import ServerNameEditor from "./ServerNameEditor.js";
import ServerIconEditor from "./ServerIconEditor.js";
import ServerEmojiManager from "./ServerEmojiManager.js";
import { fetchWithAuth } from "@utils/fetchWithAuth.jsx";
import  { useAuth } from "@contexts/AuthContext.jsx";

const ServerSettings: React.FC = () => {
    const { serverId } = useParams();

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

    return (
        <motion.div
            initial={{ transform: 'translateY(5%)', opacity: 0 }}
            animate={{ transform: 'translateY(0)', opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <div className="profile-top-section">
                <div className="h-[250px] w-full rounded-lg bg-[radial-gradient(circle_at_10%_50%,rgba(133,132,212,0.432)_10%,transparent_30%)]">
                    <div className="relative left-[30px] top-20 flex items-center gap-4">
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

            <ServerEmojiManager serverId={serverId} />
        </motion.div>
    )
}

export default ServerSettings;