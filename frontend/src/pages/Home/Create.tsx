import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';

import Sidebar from '@components/Sidebar/Sidebar.js';
import SidebarChannels from '@components/SidebarChannels/SidebarChannels.js';

const Create: React.FC = () => {
  const { addToast } = useToast();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      addToast("info", "You must be logged in to use Liscord");
      navigate("/sign-up");
    }
  }, [userInfo]);

  return (
    <div className="m-0">
      <Sidebar />
      <SidebarChannels />
    </div>
  )
}

export default Create;