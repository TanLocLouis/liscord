import { useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import Button from '@components/Button/Button.js';
import { useAuth } from '@contexts/AuthContext.js';
import { useToast } from '@contexts/ToastContext.js';
import { fetchWithAuth } from '@utils/fetchWithAuth.jsx';
import Input from '@components/Input/Input.js';

interface CreateInviteProps {
  setIsCreateInviteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  serverId: string;
  serverName?: string;
}

interface InviteResult {
  code: string;
  inviteLink: string;
  expiresAt: string | null;
  maxUses: number | null;
}

const CreateInvite = (props: CreateInviteProps) => {
  const [maxUses, setMaxUses] = useState('');
  const [expiresInHours, setExpiresInHours] = useState('');
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authContext = useAuth();
  const { addToast } = useToast();

  const handleCloseCreateInviteClicked = (e: MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    props.setIsCreateInviteOpen(false);
  };

  const handleNumericInput = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const nextValue = e.target.value;
    if (nextValue === '' || /^\d+$/.test(nextValue)) {
      setter(nextValue);
    }
  };

  const handleCreateInviteSubmitted = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!props.serverId) {
      addToast('error', 'Please select a server first.');
      return;
    }

    const payload: { maxUses?: number; expiresInHours?: number } = {};

    if (maxUses) {
      payload.maxUses = Number(maxUses);
    }
    if (expiresInHours) {
      payload.expiresInHours = Number(expiresInHours);
    }

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/servers/${props.serverId}/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authContext?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message ?? 'Failed to create invite link');
      }

      const data = (await response.json()) as InviteResult;
      setInviteResult(data);
      addToast('success', 'Invite link created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create invite link';
      addToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteResult?.inviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(`${import.meta.env.VITE_HOST}${inviteResult.inviteLink}`);
      addToast('success', 'Invite link copied to clipboard.');
    } catch {
      addToast('error', 'Could not copy invite link.');
    }
  };

  return (
    <div className="fixed z-10">
      <div className="fixed top-0 left-0 h-full w-full bg-black-1 backdrop-blur-sm"></div>
      <div className="fixed top-1/2 left-1/2 w-[420px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[var(--color-secondary)] border border-[var(--color-primary)]">
        <form className="m-5 flex flex-col" onSubmit={handleCreateInviteSubmitted}>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl text-[var(--color-text-primary)]">Create Invite Link</h1>
            <svg onClick={handleCloseCreateInviteClicked} xmlns="http://www.w3.org/2000/svg" width="1.5em" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M504.6 148.5C515.9 134.9 514.1 114.7 500.5 103.4C486.9 92.1 466.7 93.9 455.4 107.5L320 270L184.6 107.5C173.3 93.9 153.1 92.1 139.5 103.4C125.9 114.7 124.1 134.9 135.4 148.5L278.3 320L135.4 491.5C124.1 505.1 125.9 525.3 139.5 536.6C153.1 547.9 173.3 546.1 184.6 532.5L320 370L455.4 532.5C466.7 546.1 486.9 547.9 500.5 536.6C514.1 525.3 515.9 505.1 504.6 491.5L361.7 320L504.6 148.5z"/></svg>
          </div>

          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
            {props.serverName ? `Generate a shareable invite for ${props.serverName}.` : 'Generate a shareable invite for this server.'}
          </p>

          <label htmlFor="max-uses" className="block text-sm text-[var(--color-text-secondary)]">Max Uses (optional)</label>
          <Input
            id="max-uses"
            type="text"
            inputMode="numeric"
            value={maxUses}
            onChange={(e) => handleNumericInput(e, setMaxUses)}
            className="mt-1 block w-full rounded-md border-[var(--color-text-secondary)] shadow-sm sm:text-sm"
            placeholder="e.g. 10"
            disabled={isSubmitting}
          />

          <label htmlFor="expires-hours" className="mt-3 block text-sm text-[var(--color-text-secondary)]">Expires In Hours (optional)</label>
          <Input
            id="expires-hours"
            type="text"
            inputMode="numeric"
            value={expiresInHours}
            onChange={(e) => handleNumericInput(e, setExpiresInHours)}
            className="mt-1 block w-full rounded-md border-[var(--color-text-secondary)] shadow-sm sm:text-sm"
            placeholder="e.g. 24"
            disabled={isSubmitting}
          />

          <div className="mt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting} title={isSubmitting ? 'Creating...' : 'Create Invite'} />
          </div>

          {inviteResult ? (
            <div className="mt-4 rounded-md border border-[var(--color-secondary-soft)] bg-[var(--color-background)] p-3">
              <p className="text-sm text-[var(--color-text-secondary)]">Invite Link</p>
              <Input
                type="text"
                readOnly
                value={`${import.meta.env.VITE_HOST}${inviteResult.inviteLink}`}
                className="mt-1 w-full rounded-md border-[var(--color-text-secondary)] bg-[var(--color-secondary)] p-2 text-sm"
              />
              <div className="mt-2 flex items-center gap-2">
                <Button type="button" height="38px" title="Copy Link" onClick={copyInviteLink} />
                <a
                  href={`${import.meta.env.VITE_HOST}${inviteResult.inviteLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-[var(--color-text-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                >
                  Open
                </a>
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
};

export default CreateInvite;
