import { useState } from 'react';

import Sidebar from '@components/Sidebar/Sidebar.js';
import SidebarChannels from '@components/SidebarChannels/SidebarChannels.js';
import ChatBox from '@components/ChatBox/ChatBox.js';
import { motion } from "motion/react";
import { useParams } from 'react-router';
import Welcome from '@components/Welcome/Welcome.js';

const Home: React.FC = () => {
  // const currentServerId = useParams().serverId;
  // const currentChannelId = useParams().channelId;

  const getInitialServerInfo = (): { serverName: string; serverId: string; serverType: 'group' | 'dm' } => {
    const persisted = localStorage.getItem("lastServerInfo");
    if (!persisted) {
      return { serverName: "Discover", serverId: "discover", serverType: 'group' };
    }

    const parsed = JSON.parse(persisted) as { serverName?: string; serverId?: string; serverType?: 'group' | 'dm' };
    const serverName = parsed.serverName || "Discover";
    const serverId = parsed.serverId || "discover";
    const inferredType: 'group' | 'dm' = parsed.serverType
      || (serverName.toLowerCase().startsWith("dm:") ? 'dm' : 'group');

    return { serverName, serverId, serverType: inferredType };
  };

  const [currentServerInfo, setCurrentServerInfo] = useState<{ serverName: string; serverId: string; serverType: 'group' | 'dm' } | null>(getInitialServerInfo());
  const [currentChannelInfo, setCurrentChannelInfo] = useState<{ channelName: string; channelId: string } | null>(localStorage.getItem("lastChannelInfo") ? JSON.parse(localStorage.getItem("lastChannelInfo") as string) : null);

  const handleServerInfoChanged = (serverName: string, serverId: string, serverType: 'group' | 'dm') => {
    setCurrentServerInfo({ serverName, serverId, serverType });

    // Store last server info in localStorage 
    // to persist across page reloads
    localStorage.setItem("lastServerInfo", JSON.stringify({ serverName, serverId, serverType }));
  }

  const handleOnChannelInfoChanged = (channelName: string, channelId: string) => {
    setCurrentChannelInfo({ channelName, channelId });
  }

  return (
      <motion.div
          initial={{ transform: 'translateY(2%)', opacity: 0 }}
          animate={{ transform: 'translateY(0)', opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full"
      >
        <div className="h-screen m-0">
          <div className="h-screen m-0 pt-10 pb-10 flex">
            <Sidebar currentServerInfo={currentServerInfo} onServerInfoChanged={handleServerInfoChanged}/>
            {currentServerInfo?.serverId === "discover" ? (
              <Welcome username={"User"} serverName={currentServerInfo ? currentServerInfo.serverName : "No Server Selected"} />
            ) : (
              <>
                <SidebarChannels serverInfo={currentServerInfo} onChannelInfoChanged={handleOnChannelInfoChanged}/>
                <ChatBox channelInfo={currentChannelInfo} serverInfo={currentServerInfo}/>
              </>
            )}
          </div>
        </div>
      </motion.div>
  )
}

export default Home;