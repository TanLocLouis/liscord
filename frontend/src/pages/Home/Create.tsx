import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';

import Sidebar from '@components/Sidebar/Sidebar.js';
import SidebarChannels from '@components/SidebarChannels/SidebarChannels.js';

const Create: React.FC = () => {
  const [currentServerName, setCurrentServerName] = useState<string>("");
  const [currentServerId, setCurrentServerId] = useState<string>("");

  const { addToast } = useToast();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      addToast("info", "You must be logged in to use Liscord");
      navigate("/sign-up");
    }
  }, [userInfo]);

  const handleServerInfoChanged = (serverName: string, serverId: string) => {
    setCurrentServerName(serverName);
    setCurrentServerId(serverId);
  }

  return (
    <div className="m-0 flex">
      <Sidebar onServerInfoChanged={handleServerInfoChanged}/>
      <SidebarChannels serverName={currentServerName} serverId={currentServerId}/>
    </div>
  )
}

export default Create;