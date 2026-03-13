import Button from "@components/Button/Button.js";
import MessageCard, { type ChatMessage } from "./MessageCard.js";
import { useAuth } from "@contexts/AuthContext.jsx";
import { fetchWithAuth } from "@utils/fetchWithAuth.jsx";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type Member = {
    id: string;
    name: string;
    status: "online" | "idle" | "dnd" | "offline";
};

// const members: Member[] = [
// ];

interface ChatBoxProps {
    channelInfo: {
        channelName: string;
        channelId: string;
    } | null;
}

const ChatBox = ( { channelInfo } : ChatBoxProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const authContext = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const activeChannelIdRef = useRef<string | null>(null);

    const toAvatar = (name: string) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name || "U")}`;

    const fetchMessages = async () => {
        if (!channelInfo?.channelId) {
            setMessages([]);
            return;
        }

        try {
            const response = await fetchWithAuth(
                authContext,
                `${import.meta.env.VITE_API_URL}/api/messages/channel/${channelInfo.channelId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authContext?.accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }

            const data = await response.json();

            const normalizedMessages = Array.isArray(data.messages)
                ? data.messages.map((message: ChatMessage) => ({
                    ...message,
                    avatar: message.avatar || toAvatar(message.user_name),
                }))
                : [];

            setMessages(normalizedMessages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessages([]);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [channelInfo?.channelId, authContext?.accessToken]);

    useEffect(() => {
        activeChannelIdRef.current = channelInfo?.channelId ?? null;
    }, [channelInfo?.channelId]);

    useEffect(() => {
        if (!authContext?.accessToken) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        const socket = io(import.meta.env.VITE_API_URL, {
            transports: ["websocket"],
            auth: {
                token: authContext.accessToken,
            },
        });

        socketRef.current = socket;

        socket.on("receive_message", (incomingMessage: any) => {
            const activeChannelId = activeChannelIdRef.current;
            if (!activeChannelId || incomingMessage?.channel_id !== activeChannelId) {
                return;
            }

            const normalizedMessage: ChatMessage = {
                message_id: incomingMessage.message_id,
                user_name: incomingMessage.user_name || "Unknown User",
                avatar: incomingMessage.avatar || toAvatar(incomingMessage.user_name || "Unknown User"),
                created_at: incomingMessage.created_at || new Date().toISOString(),
                content: incomingMessage.content || "",
                mine: incomingMessage.user_name && incomingMessage.user_name === authContext.userInfo?.username,
            };

            setMessages((prev) => {
                if (prev.some((message) => message.message_id === normalizedMessage.message_id)) {
                    return prev;
                }
                return [normalizedMessage, ...prev];
            });
        });

        socket.on("socket_error", (errorPayload: { message?: string }) => {
            console.error("Socket error:", errorPayload?.message ?? "Unknown socket error");
        });

        socket.on("connect_error", (error: Error) => {
            console.error("Socket connect error:", error.message);
        });

        return () => {
            socket.disconnect();
        };
    }, [authContext?.accessToken, authContext?.userInfo?.username]);

    useEffect(() => {
        const socket = socketRef.current;
        const channelId = channelInfo?.channelId;

        if (!socket || !channelId) {
            return;
        }

        socket.emit("join_room", channelId);

        return () => {
            socket.emit("leave_room", channelId);
        };
    }, [channelInfo?.channelId]);

    const handleSendMessage = async () => {
        if (!channelInfo?.channelId || !messageInput.trim() || isSending) {
            return;
        }

        try {
            setIsSending(true);
            const content = messageInput.trim();
            const socket = socketRef.current;

            if (socket?.connected) {
                socket.emit("send_message", {
                    roomId: channelInfo.channelId,
                    channelId: channelInfo.channelId,
                    content,
                });

                setMessageInput("");
                return;
            }

            const response = await fetchWithAuth(
                authContext,
                `${import.meta.env.VITE_API_URL}/api/messages/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authContext?.accessToken}`,
                    },
                    body: JSON.stringify({
                        channelId: channelInfo.channelId,
                        content,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            setMessageInput("");
            await fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleComposerKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            await handleSendMessage();
        }
    };

    return (
        <section
            className="flex-1 min-w-0 h-[calc(100vh-85px)] m-2 rounded-[18px] border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] shadow-[0_16px_38px_color-mix(in_oklab,var(--color-text-primary)_18%,transparent)] grid grid-rows-[auto_1fr_auto] overflow-hidden bg-[radial-gradient(circle_at_10%_-10%,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_45%),radial-gradient(circle_at_90%_0%,color-mix(in_oklab,var(--color-info)_16%,transparent),transparent_38%),color-mix(in_oklab,var(--color-secondary)_86%,var(--color-primary-soft)_14%)] max-md:mx-2 max-md:my-[0.4rem] max-md:rounded-[14px]"
            aria-label="Chat panel"
        >
            <header className="flex justify-between items-center gap-4 px-5 py-4 border-b border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] bg-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-secondary)_72%,var(--color-primary-soft)_28%)_78%,transparent)] backdrop-blur-[8px] max-md:p-[0.85rem]">
                <div>
                    <h2 className="text-[1.15rem] leading-[1.15]"># {channelInfo?.channelName || "general"}</h2>
                </div>

                {/* <div className="flex items-center gap-2" aria-label="Chat actions">
                    <button
                        type="button"
                        className="w-[34px] h-[34px] rounded-[10px] border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] bg-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-secondary)_86%,var(--color-primary-soft)_14%)_84%,transparent)] text-[var(--color-text-primary)] inline-flex items-center justify-center cursor-pointer hover:border-[color:color-mix(in_oklab,var(--color-primary)_44%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--color-primary-soft)_24%,color-mix(in_oklab,var(--color-secondary)_86%,var(--color-primary-soft)_14%)_76%)]"
                        aria-label="Open thread list"
                    >
                    </button>
                </div> */}
            </header>

            <div className="grid grid-cols-[1fr_50px] min-h-0 max-[1080px]:grid-cols-1">
                <div className="min-h-0 overflow-y-auto p-[1.1rem] flex flex-col-reverse gap-3" aria-label="Message list">
                    {messages.map((message) => (
                        <MessageCard key={message.message_id} message={message}/>
                    ))}
                </div>

                {/* <aside className="border-l border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] px-[0.9rem] py-4 bg-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-secondary)_72%,var(--color-primary-soft)_28%)_78%,transparent)] max-[1080px]:hidden" aria-label="Members list">
                    <h3 className="text-[0.95rem] mb-3">Members</h3>
                    <ul className="list-none grid gap-[0.55rem]">
                        {members.map((member) => (
                            <li key={member.id} className="flex items-center gap-[0.55rem] text-[0.87rem]">
                                <span
                                    className={`w-[9px] h-[9px] rounded-full ${
                                        member.status === "online"
                                            ? "bg-[var(--color-success)]"
                                            : member.status === "idle"
                                              ? "bg-[var(--color-warning)]"
                                              : member.status === "dnd"
                                                ? "bg-[var(--color-error)]"
                                                : "bg-[var(--color-gray-500)]"
                                    }`}
                                    aria-hidden="true"
                                />
                                <span>{member.name}</span>
                            </li>
                        ))}
                    </ul>
                </aside> */}
            </div>

            <footer className="border-t border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] grid grid-cols-[1fr_auto] items-center gap-[0.6rem] px-4 py-[0.8rem] bg-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-secondary)_72%,var(--color-primary-soft)_28%)_74%,transparent)] max-md:grid-cols-1 place-items-center">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    className="w-full m-1 border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] rounded-[10px] px-[0.8rem] py-[0.62rem] bg-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-secondary)_86%,var(--color-primary-soft)_14%)_90%,transparent)] text-[var(--color-text-primary)] text-[0.92rem] focus:outline-none focus:border-[color:color-mix(in_oklab,var(--color-primary)_50%,transparent)]"
                    placeholder={`Message #${channelInfo?.channelName || "general"}`}
                    aria-label="Message composer"
                />

                <Button
                    width="100px"
                    height="40px"
                    title={isSending ? "Sending..." : "Send"}
                    color="var(--color-text-primary)"
                    backgroundColor="var(--color-primary)"
                    onClick={handleSendMessage}
                    disabled={!channelInfo?.channelId || !messageInput.trim() || isSending}
                />
            </footer>
        </section>
    );
};

export default ChatBox;