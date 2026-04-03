import { useNavigate } from "react-router";
import { useAuth } from "@contexts/AuthContext";
import { useToast } from "@contexts/ToastContext";
import { fetchWithAuth } from "@utils/fetchWithAuth";
import { useState } from "react";

interface ContextMenuProps {
    menu: {
        visible: boolean;
        x: number;
        y: number;
        targetId: string | null;
    };
    closeMenu: () => void;
    onServerLeft?: () => void;
}

const ContextMenu = ( { menu, closeMenu, onServerLeft } : ContextMenuProps ) => {
    if (!menu.visible) return null;

    const redirect = useNavigate();
    const { addToast } = useToast();
    const authContext = useAuth();
    const [isLeaving, setIsLeaving] = useState(false);

    const handleServerSettingsClick = () => {
        closeMenu();
        redirect(`/server/${menu.targetId}/settings`);
    }

    const handleLeaveServerClick = async () => {
        if (!confirm("Are you sure you want to leave this server?")) {
            return;
        }

        closeMenu();
        setIsLeaving(true);

        try {
            const res = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/servers/${menu.targetId}/leave`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authContext.accessToken}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to leave server");
            }

            addToast("success", "Left server successfully");

            // Call the callback to refresh server list
            if (onServerLeft) {
                onServerLeft();
            }

            // Redirect to home
            redirect("/");
        } catch (err) {
            console.error("Error leaving server:", err);
            addToast("error", "Failed to leave server. Please try again.");
        } finally {
            setIsLeaving(false);
        }
    }

    return (
        <ul
            style={{
                position: 'absolute',
                top: menu.y,
                left: menu.x,
                backgroundColor: 'var(--color-secondary)',
                border: '2px solid var(--color-primary)',
                borderRadius: '0.5em',
                boxShadow: '0 2px 10px var(--color-primary)',
                listStyle: 'none',
                padding: '10px',
                zIndex: 1000
            }}
            onMouseLeave={closeMenu}
        >
            <li onClick={handleServerSettingsClick} className="cursor-pointer mt-1 p-2 rounded hover:bg-[var(--color-primary)]">Server Settings</li>
            <li
                onClick={handleLeaveServerClick}
                className={`cursor-pointer mt-1 p-2 rounded ${isLeaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500'}`}
                style={{ pointerEvents: isLeaving ? 'none' : 'auto' }}
            >
                {isLeaving ? 'Leaving...' : 'Leave Server'}
            </li>
        </ul>
    )
}

export default ContextMenu;