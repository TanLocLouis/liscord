
import { useState, useEffect } from "react";
import CreateChannel from "./CreateChannel.js";
import { useAuth } from "@contexts/AuthContext.js";
import { fetchWithAuth } from "@utils/fetchWithAuth.jsx";

interface Channel {
    channel_id: string;
    channel_name: string;
    type: string;
    position: number;
}

interface SidebarChannelsProps {
    serverInfo: {
        serverName: string;
        serverId: string;
    } | null;
    onChannelInfoChanged: (channelName: string, channelId: string) => void;
}

const SidebarChannels = ( { serverInfo, onChannelInfoChanged } : SidebarChannelsProps ) => {
    const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
    const [channelsList, setChannelsList] = useState<Channel[]>([]);
    const [currentChannelId, setCurrentChannelId] = useState<string>("");
    const authContext = useAuth();

    useEffect(() => {
        const getServerChannels = async () => {
            if (!serverInfo?.serverId) {
                setChannelsList([]);
                return;
            }

            try {
                const response = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/channels/server/${serverInfo?.serverId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authContext?.accessToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch channels');
                }
                const data = await response.json();
                setChannelsList(data.channels);
            } catch (error) {
                console.error('Error fetching channels:', error);
                setChannelsList([]);
            }
        };

        getServerChannels();
    }, [serverInfo?.serverId, isCreateChannelOpen])

    const handleChannelClicked = (channelName: string, channelId: string) => {
        setCurrentChannelId(channelId);
        onChannelInfoChanged(channelName, channelId);
    };

    return (
        <div className="w-[200px] h-full pl-2 bg-[var(--color-secondary)] border-l border-[var(--color-text-primary)]">
            <div>
                <h2 className="text-lg font-bold mb-2">{serverInfo?.serverName ? serverInfo.serverName : "Please choose or create a server"}</h2> 
            </div>

            <hr className="border-[var(--color-text-primary)] my-2"></hr>
            
            <div>
                <label>{channelsList.length === 0 ? "No channels available" : ""}</label>
                <ul className="mt-2 mb-1 flex flex-col gap-2">
                    {channelsList.map((channel) => (
                        <li key={channel.channel_id} onClick={() => handleChannelClicked(channel.channel_name, channel.channel_id)} className="">
                            <div className={`p-1 border rounded hover:bg-[var(--color-primary)] cursor-pointer ${currentChannelId === channel.channel_id ? 'bg-[var(--color-primary)] border rounded' : ''}`}>
                                <label className="text-[var(--color-text-primary)]"># {channel.channel_name}</label>
                            </div>
                        </li>
                    ))}

                    <hr className="border-[var(--color-text-primary)] my-2"></hr>

                    <li key={"create-channel"} onClick={() => setIsCreateChannelOpen(true)}>
                        <div className="w-10 h-10 flex justify-center items-center border-2 rounded-lg border-[var(--color-text-primary)] hover:scale-105 hover:bg-[var(--color-primary)] hover:shadow-[0_2px_10px_rgba(255,255,255,0.5)] transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="var(--color-text-primary)" width="2em"  viewBox="0 0 640 640"><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>
                        </div>
                    </li>
                </ul>
            </div>

            {isCreateChannelOpen && <CreateChannel setIsCreateChannelOpen={setIsCreateChannelOpen} serverId={serverInfo?.serverId} />}

        </div>
    )
}

export default SidebarChannels;