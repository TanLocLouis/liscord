import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import './Create.css';

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
    <div>

      <h1>Hi</h1>
      <h1>Hi</h1>
      <h1>Hi</h1>
      <h1>Hi</h1>
      <h1>Hi</h1>
    </div>
  )
}

export default Create;