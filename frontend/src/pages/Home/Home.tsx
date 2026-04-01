import { useState } from 'react';

import Sidebar from '@components/Sidebar/Sidebar.js';
import SidebarChannels from '@components/SidebarChannels/SidebarChannels.js';
import ChatBox from '@components/ChatBox/ChatBox.js';
import { motion } from "motion/react";
import { useParams } from 'react-router';

const Home: React.FC = () => {
  // const currentServerId = useParams().serverId;
  // const currentChannelId = useParams().channelId;

  const [currentServerInfo, setCurrentServerInfo] = useState<{ serverName: string; serverId: string } | null>(localStorage.getItem("lastServerInfo") ? JSON.parse(localStorage.getItem("lastServerInfo") as string) : null);
  const [currentChannelInfo, setCurrentChannelInfo] = useState<{ channelName: string; channelId: string } | null>(localStorage.getItem("lastChannelInfo") ? JSON.parse(localStorage.getItem("lastChannelInfo") as string) : null);

  const handleServerInfoChanged = (serverName: string, serverId: string) => {
    setCurrentServerInfo({ serverName, serverId });

    // Store last server info in localStorage 
    // to persist across page reloads
    localStorage.setItem("lastServerInfo", JSON.stringify({ serverName, serverId }));
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
            <Sidebar onServerInfoChanged={handleServerInfoChanged}/>
            <SidebarChannels serverInfo={currentServerInfo} onChannelInfoChanged={handleOnChannelInfoChanged}/>
            <ChatBox channelInfo={currentChannelInfo} serverInfo={currentServerInfo}/>
          </div>
        </div>
      </motion.div>
  )
}

export default Home;