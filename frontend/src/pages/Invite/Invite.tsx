import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '@contexts/AuthContext.js';
import { useToast } from '@contexts/ToastContext.js';

type JoinStatus = 'joining' | 'redirecting' | 'success' | 'error';

const Invite: React.FC = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const authContext = useAuth();
  const { addToast } = useToast();

  const [status, setStatus] = useState<JoinStatus>('joining');
  const [message, setMessage] = useState('Processing invite...');
  const [joinedServerId, setJoinedServerId] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const hasStarted = useRef(false);

  const getAccessToken = async () => {
    if (authContext.accessToken) {
      return authContext.accessToken;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const refreshData = await refreshResponse.json();
    return typeof refreshData?.accessToken === 'string' ? refreshData.accessToken : null;
  };

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }
    hasStarted.current = true;

    const processInvite = async () => {
      if (!code) {
        setStatus('error');
        setMessage('Invalid invite code.');
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        setStatus('redirecting');
        setMessage('Redirecting to login...');
        navigate(`/login?next=${encodeURIComponent(`/invite/${code}`)}`, { replace: true });
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/servers/invites/${encodeURIComponent(code)}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.message ?? 'Failed to join server with this invite.';
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const didJoin = data?.joined !== false;
        setHasJoined(didJoin);
        setJoinedServerId(typeof data?.serverId === 'string' ? data.serverId : null);
        setStatus('success');
        setMessage(didJoin ? 'You have joined the server.' : 'You are already a member of this server.');
        addToast('success', data.message ?? 'Invite processed successfully');
      } catch (error) {
        const text = error instanceof Error ? error.message : 'Failed to process invite.';
        setStatus('error');
        setMessage(text);
      }
    };

    processInvite();
  }, [code, navigate, authContext.accessToken, addToast]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-secondary-soft)] bg-[var(--color-secondary)] p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text-secondary)]">Invite</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
        {(status === 'success' || status === 'error') ? (
          <div className="mt-4">
            {(joinedServerId || hasJoined) ? (
              <button
                type="button"
                className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-white"
                onClick={() => navigate('/')}
              >
                Open Channels
              </button>
            ) : (
              <button
                type="button"
                className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-white"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Invite;
