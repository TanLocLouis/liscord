
import { useState, useEffect } from "react";
import CreateChannel from "./CreateChannel.js";
import CreateInvite from './CreateInvite.js';
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

                    <li
                        key={"create-invite"}
                        onClick={() => {
                            if (serverInfo?.serverId) {
                                setIsCreateInviteOpen(true);
                            }
                        }}
                    >
                        <div className="w-10 h-10 flex justify-center items-center border-2 rounded-lg border-[var(--color-text-primary)] hover:scale-105 hover:bg-[var(--color-primary)] hover:shadow-[0_2px_10px_rgba(255,255,255,0.5)] transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="var(--color-text-primary)" width="1.6em" viewBox="0 0 640 640"><path d="M560 272C586.5 272 608 250.5 608 224C608 197.5 586.5 176 560 176L384 176C357.5 176 336 197.5 336 224C336 250.5 357.5 272 384 272L560 272zM528 80C510.3 80 496 94.3 496 112L496 336C496 353.7 510.3 368 528 368C545.7 368 560 353.7 560 336L560 112C560 94.3 545.7 80 528 80zM80 368C53.5 368 32 389.5 32 416C32 442.5 53.5 464 80 464L256 464C282.5 464 304 442.5 304 416C304 389.5 282.5 368 256 368L80 368zM112 560C129.7 560 144 545.7 144 528L144 304C144 286.3 129.7 272 112 272C94.3 272 80 286.3 80 304L80 528C80 545.7 94.3 560 112 560zM214.6 161.4C227.1 173.9 247.4 173.9 259.9 161.4C272.4 148.9 272.4 128.6 259.9 116.1L195.9 52.1C183.4 39.6 163.1 39.6 150.6 52.1C138.1 64.6 138.1 84.9 150.6 97.4L214.6 161.4zM425.4 478.6C412.9 466.1 392.6 466.1 380.1 478.6C367.6 491.1 367.6 511.4 380.1 523.9L444.1 587.9C456.6 600.4 476.9 600.4 489.4 587.9C501.9 575.4 501.9 555.1 489.4 542.6L425.4 478.6z"/></svg>
                        </div>
                    </li>
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