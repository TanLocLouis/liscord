type IncomingMessageForNotification = {
    user_name?: string;
    channel_name?: string;
    content?: string;
    avatar?: string;
    message_id?: string | number;
};

const toAvatar = (name: string) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name || "U")}`;

const NOTIFICATION_AUTO_CLOSE_MS = 5000;

export const isBrowserNotificationSupported = () => (
    typeof window !== "undefined" && "Notification" in window
);

export const requestBrowserNotificationPermission = async () => {
    if (!isBrowserNotificationSupported()) {
        return;
    }

    if (Notification.permission === "default") {
        await Notification.requestPermission();
    }
};

export const showIncomingMessageBrowserNotification = (
    incomingMessage: IncomingMessageForNotification,
    fallbackChannelName = "general",
) => {
    if (!isBrowserNotificationSupported()) {
        return;
    }

    if (document.visibilityState === "visible") {
        return;
    }

    if (Notification.permission !== "granted") {
        return;
    }

    const senderName = incomingMessage?.user_name || "Unknown User";
    const channelName = incomingMessage?.channel_name || fallbackChannelName;
    const title = `#${channelName} - ${senderName}`;
    const body = incomingMessage?.content?.trim() || "Sent a new message";
    const icon = incomingMessage?.avatar || toAvatar(senderName);

    const notification = new Notification(title, {
        body,
        icon,
        tag: `message-${incomingMessage?.message_id || Date.now()}`,
    });

    notification.onclick = () => {
        window.focus();
        notification.close();
    };

    window.setTimeout(() => {
        notification.close();
    }, NOTIFICATION_AUTO_CLOSE_MS);
};
