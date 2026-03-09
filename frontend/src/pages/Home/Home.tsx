import { useState } from 'react';

import Sidebar from '@components/Sidebar/Sidebar.js';
import SidebarChannels from '@components/SidebarChannels/SidebarChannels.js';
import ChatBox from '@components/ChatBox/ChatBox.js';

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
      <div className="h-screen m-0">
        <div className="h-screen m-0 pt-10 pb-10 flex">
          <Sidebar onServerInfoChanged={handleServerInfoChanged}/>
          <SidebarChannels serverInfo={currentServerInfo} onChannelInfoChanged={handleOnChannelInfoChanged}/>
          <ChatBox channelInfo={currentChannelInfo}/>
        </div>
      </div>
  )
}

export default Home;