import { useState } from 'react';

import Sidebar from '@components/Sidebar/Sidebar.js';
import SidebarChannels from '@components/SidebarChannels/SidebarChannels.js';
import ChatBox from '@components/ChatBox/ChatBox.js';
import { motion } from "motion/react";

const Home: React.FC = () => {
  const [currentServerInfo, setCurrentServerInfo] = useState<{ serverName: string; serverId: string } | null>(null);
  const [currentChannelInfo, setCurrentChannelInfo] = useState<{ channelName: string; channelId: string } | null>(null);

  const handleServerInfoChanged = (serverName: string, serverId: string) => {
    setCurrentServerInfo({ serverName, serverId });
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
            <ChatBox channelInfo={currentChannelInfo}/>
          </div>
        </div>
      </motion.div>
  )
}

export default Home;