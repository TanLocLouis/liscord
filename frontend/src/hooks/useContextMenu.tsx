import { useState } from 'react';

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    targetId: string | null;
}

const useContextMenu = () => {
    const [menu, setMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        targetId: null
    })

    const openMenu = (event: React.MouseEvent, targetId: string) => {
        event.preventDefault();

        setMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            targetId
        });
    }

    const closeMenu = () => {
        setMenu({
            visible: false,
            x: 0,
            y: 0,
            targetId: null
        });
    }

    return {
        menu,
        openMenu,
        closeMenu
    };
}

export default useContextMenu;

