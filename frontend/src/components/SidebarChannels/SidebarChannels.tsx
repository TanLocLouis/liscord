
import { useState, useEffect } from "react";
import CreateChannel from "./CreateChannel/CreateChannel.js";
import { useAuth } from "../../contexts/AuthContext.js";
import { fetchWithAuth } from "../../utils/fetchWithAuth.jsx";

interface Channel {
    channel_id: string;
    channel_name: string;
    type: string;
    position: number;
}

const SidebarChannels = ( {serverName, serverId} : {serverName: string, serverId: string} ) => {
    const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
    const [channelsList, setChannelsList] = useState<Channel[]>([]);
    const authContext = useAuth();

    useEffect(() => {
        const getServerChannels = async () => {
            if (!serverId) {
                setChannelsList([]);
                return;
            }

            try {
                const response = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/channels/server/${serverId}`, {
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
    }, [serverId, isCreateChannelOpen])

    return (
        <div className="fixed w-[200px] h-full top-0 left-16 pt-12 pb-12 pl-2 bg-[var(--color-secondary)] border-l border-white">
            <div>
                <h2 className="text-lg font-bold mb-2">{serverName}</h2> 
            </div>

            <hr></hr>
            
            <div>
                <ul className="mt-4">
                    {channelsList.map((channel) => (
                        <li key={channel.channel_id} className="px-2 py-1 rounded hover:bg-[var(--color-primary)] cursor-pointer">
                            # {channel.channel_name}
                        </li>
                    ))}
                </ul>
            </div>

            <hr></hr>


            <li key={"create-channel"} onClick={() => setIsCreateChannelOpen(true)}>
                <div className="w-10 h-10 flex justify-center items-center m-0.5 mt-3 border-2 rounded-lg border-[var(--color-text-primary)] hover:scale-105 hover:bg-[var(--color-primary)] hover:shadow-[0_2px_10px_rgba(255,255,255,0.5)] transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="var(--color-text-primary)" width="2em"  viewBox="0 0 640 640"><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>
                </div>
            </li>

            {isCreateChannelOpen && <CreateChannel setIsCreateChannelOpen={setIsCreateChannelOpen} serverId={serverId} />}

        </div>
    )
}

export default SidebarChannels;