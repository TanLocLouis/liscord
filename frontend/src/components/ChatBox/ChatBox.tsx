import Button from "@components/Button/Button.js";
import MessageCard, { type ChatMessage } from "./MessageCard.js";
import { useAuth } from "@contexts/AuthContext.jsx";
import { fetchWithAuth } from "@utils/fetchWithAuth.jsx";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import Input from "@components/Input/Input.js";
import { motion } from "framer-motion";

type Member = {
    id: string;
    name: string;
    status: "online" | "idle" | "dnd" | "offline";
};

interface ChatBoxProps {
    channelInfo: {
        channelName: string;
        channelId: string;
    } | null;
}

interface MessagePayload {
    channelId: string;
    content: string;
    replyTo: string;
}

const ChatBox = ( { channelInfo } : ChatBoxProps) => {
    const authContext = useAuth();
    const activeChannelIdRef = useRef<string | null>(null);

    // Message states
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState<MessagePayload>({
        channelId: "",
        content: "",
        replyTo: "",
    });
    const [isSending, setIsSending] = useState(false);
    const [isReplying, setIsReplying] = useState<ChatMessage | false>(false);
    const socketRef = useRef<Socket | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [emitTyping, setEmitTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    // Scroll down button
    const [showScrollDown, setShowScrollDown] = useState(false);
    const messageListRef = useRef<HTMLDivElement>(null);
    // const [onlineUserCount, setOnlineUserCount] = useState(0);
    
    // Media
    const toAvatar = (name: string) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name || "U")}`;
    const notificationSound = new Audio("/sounds/nyaa.mp3");

    // Channel
    useEffect(() => {
        activeChannelIdRef.current = channelInfo?.channelId ?? null;
    }, [channelInfo?.channelId]);

    // Fetch message history when channel changes
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

    // Fetch message when open channel
    useEffect(() => {
        fetchMessages();
    }, [channelInfo?.channelId, authContext?.accessToken]);

    // Socket
    useEffect(() => {
        if (!authContext?.accessToken) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            // setOnlineUserCount(0);
            return;
        }

        // Establish WebSocket connection
        const socket = io(import.meta.env.VITE_API_URL, {
            transports: ["websocket"],
            auth: {
                token: authContext.accessToken,
            },
            // Socket will timeout after a while
            // so we need to enable reconnection 
            // to ensure the user stays connected
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        socketRef.current = socket;

        // Handle incoming messages
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
                reply_to: incomingMessage.reply_to || null,
                reply_to_content: incomingMessage.reply_to_content || null,
                mine: incomingMessage.user_name && incomingMessage.user_name === authContext.userInfo?.username,
            };

            setMessages((prev) => {
                if (prev.some((message) => message.message_id === normalizedMessage.message_id)) {
                    return prev;
                }

                // Play notification sound if the message 
                // is not sent by the current user
                if (normalizedMessage.user_name !== authContext.userInfo?.username) {
                    notificationSound.currentTime = 0;
                    notificationSound.play();
                }
                return [normalizedMessage, ...prev];
            });
        });

        // Handle socket errors
        socket.on("socket_error", (errorPayload: { message?: string }) => {
            console.error("Socket error:", errorPayload?.message ?? "Unknown socket error");
        });

        socket.on("connect_error", (error: Error) => {
            console.error("Socket connect error:", error.message);
        });

        // Get a list of user is typing
        socket?.on("typing_users", (typingUsers: string[]) => {
            setTypingUsers(typingUsers);
        });

        return () => {
            socket.disconnect();
        };
    }, [authContext?.accessToken, authContext?.userInfo?.username]);


    // Join chat room
    useEffect(() => {
        const socket = socketRef.current;
        const channelId = channelInfo?.channelId;

        if (!socket || !channelId) {
            return;
        }

        socket.emit("join_room", channelId);

        // Leave chat room
        return () => {
            socket.emit("leave_room", channelId);
        };
    }, [channelInfo?.channelId]);

    // Emit socket when user is typing
    useEffect(() => {
        const socket = socketRef.current;
        const inputValue = inputRef.current?.value;

        if (!emitTyping && inputValue !== "") {
            setEmitTyping(true);
            socket?.emit("start_typing", { channelId: channelInfo?.channelId,  });
        }

        if (inputValue === "") {
            setEmitTyping(false);
            socket?.emit("stop_typing", { channelId: channelInfo?.channelId,  });
        }
    }, [inputRef.current?.value]);

    // Handle send message
    const handleSendMessage = async () => {
        setIsReplying(false);

        if (!channelInfo?.channelId || !messageInput?.content || isSending) {
            return;
        }

        try {
            setIsSending(true);
            const content = messageInput.content.trim();
            const socket = socketRef.current;

            // Send message via WebSocket if connected
            // and save to database via REST API
            if (socket?.connected) {
                socket.emit("send_message", {
                    roomId: channelInfo.channelId,
                    channelId: channelInfo.channelId,
                    avatar: authContext?.userInfo ? authContext.userInfo.avatar : toAvatar("Unknown User"),
                    content,
                    replyTo: isReplying ? isReplying.message_id : undefined,
                    replyToContent: isReplying ? isReplying.content : undefined,
                });

                console.log("[DEBUG] ", authContext.userInfo.avatar);

                setMessageInput({
                    channelId: "",
                    content: "",
                    replyTo: ""
                });
                return;
            }
            
            // Send message via REST API as fallback 
            // if socket is not connected
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
                        replyTo: isReplying ? isReplying.message_id : undefined,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            setMessageInput({
                channelId: "",
                content: "",
                replyTo: ""
            });
            await fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    // Handle send Send button click
    // and Enter key press in message input box
    const handleComposerKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            await handleSendMessage();
        }
    };

    const handleReplyMessage = (message: ChatMessage) => () => {
        setIsReplying(message);
        inputRef.current?.focus();
    }

    // Handle scroll down button
    useEffect(() => {
        const messageList = messageListRef.current;
        if (!messageList) return;

        const handleScroll = () => {
            const { scrollTop } = messageList;

            // The messageList is flex column reversed
            // so we check if scrollTop is less than a negative threshold
            setShowScrollDown(scrollTop < -20);
        };

        messageList.addEventListener("scroll", handleScroll);

        return () => {
            messageList.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToBottom = () => {
        const messageList = messageListRef.current;
        if (!messageList) return;

        // Scroll to bottom
        // Note: Message list is flex column reversed
        messageList.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <section
            className="flex-1 min-w-0 h-[calc(100vh-85px)] m-2 rounded-[18px] border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] shadow-[0_16px_38px_color-mix(in_oklab,var(--color-text-primary)_18%,transparent)] grid grid-rows-[auto_1fr_auto] overflow-hidden bg-[radial-gradient(circle_at_10%_-10%,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_45%),radial-gradient(circle_at_90%_0%,color-mix(in_oklab,var(--color-info)_16%,transparent),transparent_38%),color-mix(in_oklab,var(--color-secondary)_86%,var(--color-primary-soft)_14%)] max-md:mx-2 max-md:my-[0.4rem] max-md:rounded-[14px]"
            aria-label="Chat panel"
        >
            <header className="flex justify-between items-center gap-4 px-5 py-4 border-b border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] bg-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-secondary)_72%,var(--color-primary-soft)_28%)_78%,transparent)] backdrop-blur-[8px] max-md:p-[0.85rem]">
                <div>
                    <h2 className="text-[1.15rem] leading-[1.15] text-[var(--color-text-secondary)]"># {channelInfo?.channelName || "general"}</h2>
                </div>
                {/* <div className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_oklab,var(--color-success)_58%,transparent)] bg-[color:color-mix(in_oklab,var(--color-success)_18%,transparent)] px-3 py-1 text-[0.82rem] text-[var(--color-text-primary)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
                    <span>{onlineUserCount} online</span>
                </div> */}
            </header>
                
            {/* Show message history */}
            <div className="grid grid-cols-[1fr_50px] min-h-0 max-[1080px]:grid-cols-1">
                <div className="min-h-0 overflow-y-auto p-[1.1rem] flex flex-col-reverse gap-3" 
                     aria-label="Message list"
                     ref={messageListRef}>
                    {messages.map((message) => (
                        <div className="group grid grid-cols-[1fr_50px] gap-3" key={message.message_id}>
                            {message.reply_to_content && (
                                <div className="col-span-2 border-l border-[color:color-mix(in_oklab,var(--color-primary)_50%,transparent)] pl-3 mt-1">
                                    <p className="text-xs text-[var(--color-primary)] mb-1">Replying to:</p>
                                    <p className="text-sm text-[var(--color-text-primary)]">{message.reply_to_content || "Original message not found"}</p>
                                </div>
                            )}
                            {/* Indent replied message */}
                            <div className={`${message.reply_to ? "ml-5 mb-2" : ""}`}>
                                {message.user_name === authContext.userInfo?.username && (
                                    <span className="left-[20px] top-[50px] text-[0.8em] text-[var(--color-primary)] opacity-80" aria-label="You">You</span>
                                )}
                                <MessageCard key={message.message_id} message={message}/>
                            </div>
                            {/* Show reply button when hovering */}
                            <div className="hidden group-hover:flex justify-center items-center rounded-lg hover:bg-[var(--color-primary)]"
                                 onClick={handleReplyMessage(message)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" fill="var(--color-text-primary)" viewBox="0 0 640 640"><path d="M268.2 82.4C280.2 87.4 288 99 288 112L288 192L400 192C497.2 192 576 270.8 576 368C576 481.3 494.5 531.9 475.8 542.1C473.3 543.5 470.5 544 467.7 544C456.8 544 448 535.1 448 524.3C448 516.8 452.3 509.9 457.8 504.8C467.2 496 480 478.4 480 448.1C480 395.1 437 352.1 384 352.1L288 352.1L288 432.1C288 445 280.2 456.7 268.2 461.7C256.2 466.7 242.5 463.9 233.3 454.8L73.3 294.8C60.8 282.3 60.8 262 73.3 249.5L233.3 89.5C242.5 80.3 256.2 77.6 268.2 82.6z"/></svg>
                            </div>
                        </div>
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

            {/* Scroll down button */}
            {showScrollDown &&
                <div className="absolute bottom-[150px] right-[40px] bg-opacity-80">
                    <Button 
                        width="40px"
                        height="40px"
                        title="⬇️"
                        className="absolute bottom-[150px] right-[40px] bg-[var(--color-primary)] w-[100px] border rounded-lg p-1"
                        onClick={scrollToBottom}>
                    </Button>
                </div>
            }

            {typingUsers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                >
                    <div className="text-sm text-muted-foreground pl-5 pb-5">
                        {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                    </div>
                </motion.div>
            )}

            {/* Replying to message preview */}
            {isReplying && (
                <>
                <div className="bg-[var(--color-text)] border border-[var(--color-primary)] rounded-lg p-3">
                    <div className="w-full flex justify-between items-center mb-2">
                        <h3 className="">Replying to this message</h3>
                        <svg onClick={() => {setIsReplying(false)}} xmlns="http://www.w3.org/2000/svg" width="1.5em" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M504.6 148.5C515.9 134.9 514.1 114.7 500.5 103.4C486.9 92.1 466.7 93.9 455.4 107.5L320 270L184.6 107.5C173.3 93.9 153.1 92.1 139.5 103.4C125.9 114.7 124.1 134.9 135.4 148.5L278.3 320L135.4 491.5C124.1 505.1 125.9 525.3 139.5 536.6C153.1 547.9 173.3 546.1 184.6 532.5L320 370L455.4 532.5C466.7 546.1 486.9 547.9 500.5 536.6C514.1 525.3 515.9 505.1 504.6 491.5L361.7 320L504.6 148.5z"/></svg>
                    </div>
                    <MessageCard message={isReplying} />
                </div>
                </>
            )}

            {/* Message type box */}
            <footer className="border-t border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] grid grid-cols-[1fr_auto] items-center gap-[0.6rem] px-4 py-[0.8rem] bg-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-secondary)_72%,var(--color-primary-soft)_28%)_74%,transparent)] max-md:grid-cols-1 place-items-center">
                <Input
                    type="text"
                    value={messageInput?.content || ""}
                    onChange={((event) => setMessageInput(prev => ({ ...prev, content: event.target.value })))}
                    onKeyDown={handleComposerKeyDown}
                    className="w-full m-1 border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] rounded-[10px] px-[0.8rem] py-[0.62rem] bg-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-secondary)_86%,var(--color-primary-soft)_14%)_90%,transparent)] text-[var(--color-text-primary)] text-[0.92rem] focus:outline-none focus:border-[color:color-mix(in_oklab,var(--color-primary)_50%,transparent)]"
                    placeholder={`Message #${channelInfo?.channelName || "general"}`}
                    aria-label="Message composer"
                    ref={inputRef}
                />

                <Button
                    width="100px"
                    height="40px"
                    title={isSending ? "Sending..." : "Send"}
                    color="var(--color-text-primary)"
                    backgroundColor="var(--color-primary)"
                    onClick={handleSendMessage}
                    disabled={!channelInfo?.channelId || !messageInput?.content.trim() || isSending}
                />
            </footer>
        </section>
    );
};

export default ChatBox;