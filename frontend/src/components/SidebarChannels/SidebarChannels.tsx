
import { useState, useEffect } from "react";
import CreateChannel from "./CreateChannel.js";
import CreateInvite from './CreateInvite.js';
import ChannelCard from "./ChannelCard.js";
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
    const [isCreateInviteOpen, setIsCreateInviteOpen] = useState(false);
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

    useEffect(() => {
        if (channelsList.length > 0) {
            const firstChannel = channelsList[0];

            if (firstChannel) {
                setCurrentChannelId(firstChannel.channel_id);
                onChannelInfoChanged(firstChannel.channel_name, firstChannel.channel_id);
            }
        }
    }, [channelsList])

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
                        <ChannelCard
                            key={channel.channel_id}
                            channelId={channel.channel_id}
                            channelName={channel.channel_name}
                            isActive={currentChannelId === channel.channel_id}
                            onClick={handleChannelClicked}
                        />
                    ))}

                    <hr className="border-[var(--color-text-primary)] my-2"></hr>

                    <div className="flex gap-1">
                        {serverInfo?.serverId && (
                        <li key={"create-channel"} onClick={() => setIsCreateChannelOpen(true)}>
                            <div className="w-10 h-10 flex justify-center items-center border-2 rounded-lg border-[var(--color-text-primary)] hover:scale-105 hover:bg-[var(--color-primary)] hover:shadow-[0_2px_10px_rgba(255,255,255,0.5)] transition-all duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="var(--color-text-primary)" width="2em"  viewBox="0 0 640 640"><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>
                            </div>
                        </li>)}

                        {serverInfo?.serverId && (
                        <li
                            key={"create-invite"}
                            onClick={() => {
                                if (serverInfo?.serverId) {
                                    setIsCreateInviteOpen(true);
                                }
                            }}
                        >
                            <div className="w-10 h-10 flex justify-center items-center border-2 rounded-lg border-[var(--color-text-primary)] hover:scale-105 hover:bg-[var(--color-primary)] hover:shadow-[0_2px_10px_rgba(255,255,255,0.5)] transition-all duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="var(--color-text-primary)" viewBox="0 0 640 640"><path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z"/></svg>
                            </div>
                        </li>)}
                    </div>

                </ul>
            </div>

            {isCreateChannelOpen && serverInfo?.serverId && (
                <CreateChannel
                    setIsCreateChannelOpen={setIsCreateChannelOpen}
                    serverId={serverInfo.serverId}
                />
            )}
            {isCreateInviteOpen && serverInfo?.serverId && (
                <CreateInvite
                    setIsCreateInviteOpen={setIsCreateInviteOpen}
                    serverId={serverInfo.serverId}
                    {...(serverInfo.serverName ? { serverName: serverInfo.serverName } : {})}
                />
            )}

        </div>
    )
}

export default SidebarChannels;