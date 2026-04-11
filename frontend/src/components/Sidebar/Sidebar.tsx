import CreateServer from "./CreateServer.js"
import { useAuth } from "@contexts/AuthContext.jsx";
import { fetchWithAuth } from "@utils/fetchWithAuth.jsx";
import useContextMenu from "../../hooks/useContextMenu.js";
import ContextMenu from "@components/ChannelMenu/ContextMenu.js";

import { useEffect, useState } from "react";

interface onSerververInfoChangedType {
    (serverName: string, serverId: string, serverType: 'group' | 'dm'): void;
}
interface SidebarType {
    currentServerId: string;
    currentServerName: string;
}
interface ServerListType {
    server_id: string;
    server_name: string;
    server_icon: string | null;
    type: 'group' | 'dm';
}

const Sidebar = ( { onServerInfoChanged } : { onServerInfoChanged: onSerververInfoChangedType }) => {
    const [isCreateServerOpen, setIsCreateServerOpen] = useState<true | false>(false);
    const [serverList, setServerList] = useState<ServerListType[]>([]);

    const [serverInfo, setServerInfo] = useState<SidebarType>({
        currentServerId: "",
        currentServerName: "",
    });

    const { menu, openMenu, closeMenu } = useContextMenu();

    const authContext = useAuth();

    const getJoinedServers = async () => {
        try {
            const response = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/servers/joined`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authContext?.accessToken}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch joined servers');
            }
            const data = await response.json();
            setServerList(data.servers);
        }
        catch (error) {
            console.error('Error fetching joined servers:', error);
        }
    };

    useEffect(() => {
        getJoinedServers();
    }, [isCreateServerOpen])

    // 
    const handleServerClicked = (serverName: string, serverId: string, serverType: 'group' | 'dm') => {
        setServerInfo({
            currentServerId: serverId,
            currentServerName: serverName,
        });
        
        onServerInfoChanged(serverName, serverId, serverType);

    };

    const discoverIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="var(--color-text-primary)" viewBox="0 0 640 640"><path d="M119.7 263.7L150.6 294.6C156.6 300.6 164.7 304 173.2 304L194.7 304C203.2 304 211.3 307.4 217.3 313.4L246.6 342.7C252.6 348.7 256 356.8 256 365.3L256 402.8C256 411.3 259.4 419.4 265.4 425.4L278.7 438.7C284.7 444.7 288.1 452.8 288.1 461.3L288.1 480C288.1 497.7 302.4 512 320.1 512C337.8 512 352.1 497.7 352.1 480L352.1 477.3C352.1 468.8 355.5 460.7 361.5 454.7L406.8 409.4C412.8 403.4 416.2 395.3 416.2 386.8L416.2 352.1C416.2 334.4 401.9 320.1 384.2 320.1L301.5 320.1C293 320.1 284.9 316.7 278.9 310.7L262.9 294.7C258.7 290.5 256.3 284.7 256.3 278.7C256.3 266.2 266.4 256.1 278.9 256.1L313.6 256.1C326.1 256.1 336.2 246 336.2 233.5C336.2 227.5 333.8 221.7 329.6 217.5L309.9 197.8C306 194 304 189.1 304 184C304 178.9 306 174 309.7 170.3L327 153C332.8 147.2 336.1 139.3 336.1 131.1C336.1 123.9 333.7 117.4 329.7 112.2C326.5 112.1 323.3 112 320.1 112C224.7 112 144.4 176.2 119.8 263.7zM528 320C528 285.4 519.6 252.8 504.6 224.2C498.2 225.1 491.9 228.1 486.7 233.3L473.3 246.7C467.3 252.7 463.9 260.8 463.9 269.3L463.9 304C463.9 321.7 478.2 336 495.9 336L520 336C522.5 336 525 335.7 527.3 335.2C527.7 330.2 527.8 325.1 527.8 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z"/></svg>
    const createServerIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="var(--color-text-primary)" viewBox="0 0 640 640"><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>
    const serverIcon = <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" fill="var(--color-text-primary)" viewBox="0 0 640 640"><path d="M160 96C124.7 96 96 124.7 96 160L96 224C96 259.3 124.7 288 160 288L480 288C515.3 288 544 259.3 544 224L544 160C544 124.7 515.3 96 480 96L160 96zM376 168C389.3 168 400 178.7 400 192C400 205.3 389.3 216 376 216C362.7 216 352 205.3 352 192C352 178.7 362.7 168 376 168zM432 192C432 178.7 442.7 168 456 168C469.3 168 480 178.7 480 192C480 205.3 469.3 216 456 216C442.7 216 432 205.3 432 192zM160 352C124.7 352 96 380.7 96 416L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 416C544 380.7 515.3 352 480 352L160 352zM376 424C389.3 424 400 434.7 400 448C400 461.3 389.3 472 376 472C362.7 472 352 461.3 352 448C352 434.7 362.7 424 376 424zM432 448C432 434.7 442.7 424 456 424C469.3 424 480 434.7 480 448C480 461.3 469.3 472 456 472C442.7 472 432 461.3 432 448z"/></svg>

    return (
        <div>
            <div className="sidebar bg-[var(--color-secondary)] m-0 w-16 h-full flex flex-col align-center items-center overflow-y-auto">
                <ul className="">
                    {serverList.map((server) => (
                        <li onContextMenu={(e) => openMenu(e, server.server_id)} key={server.server_id} onClick={() => handleServerClicked(server.server_name, server.server_id, server.type)} title={server.server_name}>
                            <div className={`w-10 h-10 flex justify-center items-center m-0.5 mt-3 border-2 rounded-lg border-[var(--color-text-primary)] hover:scale-105 hover:bg-[var(--color-primary)] hover:shadow-[0_0_5px_5px_var(--color-primary)] transition-all duration-200 ${serverInfo.currentServerId === server.server_id ? 'scale-105 bg-[var(--color-primary)] shadow-[0_0_5px_5px_var(--color-primary)]' : ''}`}>
                                {server.server_icon ? (
                                    <img src={server.server_icon} alt={server.server_name} className="w-full h-full object-cover rounded-lg" />

                                ) : (
                                    serverIcon
                                )}
                            </div>
                        </li>
                    ))}

                    <hr className="border-[var(--color-text-primary)] my-2"></hr>
                    
                    {/* Discover */}
                    <li key={"discover"} onClick={() => handleServerClicked("Discover", "discover", 'group')}>
                        <div className="w-10 h-10 flex justify-center items-center m-0.5 mt-3 border-2 rounded-lg border-[var(--color-text-primary)] hover:scale-105 hover:bg-[var(--color-primary)] hover:shadow-[0_2px_10px_rgba(255,255,255,0.5)] transition-all duration-200">
                            {discoverIcon}
                        </div>
                    </li>

                    {/* Create Server */}
                    <li key={"create-server"} onClick={() => setIsCreateServerOpen(true)}>
                        <div className="w-10 h-10 flex justify-center items-center m-0.5 mt-3 border-2 rounded-lg border-[var(--color-text-primary)] hover:scale-105 hover:bg-[var(--color-primary)] hover:shadow-[0_2px_10px_rgba(255,255,255,0.5)] transition-all duration-200">
                            {createServerIcon}
                        </div>
                    </li>
                </ul>
            </div>

            <ContextMenu menu={menu} closeMenu={closeMenu} onServerLeft={getJoinedServers} />
            {isCreateServerOpen && <CreateServer setIsCreateServerOpen={setIsCreateServerOpen}/>}
        </div>
    )
}

export default Sidebar;