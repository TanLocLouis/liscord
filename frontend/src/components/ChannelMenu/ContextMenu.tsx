import { useNavigate } from "react-router";

interface ContextMenuProps {
    menu: {
        visible: boolean;
        x: number;
        y: number;
        targetId: string | null;
    };
    closeMenu: () => void;
}

const ContextMenu = ( { menu, closeMenu } : ContextMenuProps ) => {
    if (!menu.visible) return null;

    const redirect = useNavigate();
    const handleServerSettingsClick = () => {
        closeMenu();
        redirect(`/server/${menu.targetId}/settings`);
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
            <li onClick={handleServerSettingsClick} className="cursor-pointer mt-1 p-2 border rounded border-[var(--color-primary)] hover:bg-[var(--color-primary)]">Server Settings</li>
        </ul>
    )
}

export default ContextMenu;