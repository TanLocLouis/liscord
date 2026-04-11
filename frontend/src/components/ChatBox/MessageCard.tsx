import timeAgo from "@utils/timeAgo.js";
import { useNavigate } from "react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

type MessageReaction = {
    emojiId: string;
    emojiName: string | null;
    emojiUrl: string | null;
    emojiUnicode: string | null;
    count: number;
    reactedByMe: boolean;
};

type ServerEmoji = {
    emoji_id: string;
    name: string;
    image_url: string | null;
    unicode: string | null;
};
    
export type ChatMessage = {
    message_id: string;
    user_id: string;
    user_name: string;
    avatar: string;
    created_at: string;
    content: string;
    ciphertext?: string | null;
    iv?: string | null;
    reply_to?: string;
    reply_to_content?: string;
    mine?: boolean;
    reactions?: MessageReaction[];
};

interface MessageCardProps {
    message: ChatMessage;
    availableEmojis: ServerEmoji[];
    onReact: (message: ChatMessage, emojiId: string, reactedByMe: boolean) => void;
}

const MessageCard = ({ message, availableEmojis, onReact }: MessageCardProps) => {
    const redirect = useNavigate();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleOpenUserProfile = () => {
        redirect(`/users/${message.user_id}`);
    }

    const reactions = message.reactions || [];

    return (
        <div
            className={`grid grid-cols-[40px_1fr_auto] gap-3 items-start px-[0.7rem] py-[0.6rem] border rounded-xl bg-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-secondary)_72%,var(--color-primary-soft)_28%)_86%,transparent)] ${
                message.mine
                    ? "border-[color:color-mix(in_oklab,var(--color-primary)_35%,transparent)]"
                    : "border-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-text-primary)_22%,transparent)_74%,transparent)]"
            }`}
        >
            <img
                className="w-10 h-10 rounded-full object-cover"
                aria-hidden="true"
                src={message.avatar}
                alt={`${message.user_name}'s avatar`}
                onClick={handleOpenUserProfile}
            />

            <div>
                <div className="flex items-baseline gap-2">
                    <strong className="text-[0.95rem] text-[var(--color-text-primary)]">{message.user_name}</strong>
                    <time className="text-xs opacity-70 text-[var(--color-text-primary)]">{timeAgo(message.created_at)}</time>
                </div>
                <div className="mt-[0.35rem] text-[0.9rem] leading-[1.45] text-[var(--color-text-primary)]">
                    <ReactMarkdown
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                            p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            a: ({ ...props }) => (
                                <a
                                    className="text-[var(--color-primary)] underline underline-offset-2"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    {...props}
                                />
                            ),
                            code: ({ ...props }) => (
                                <code
                                    className="rounded bg-[color:color-mix(in_oklab,var(--color-secondary)_78%,transparent)] px-1 py-[0.1rem]"
                                    {...props}
                                />
                            ),
                            pre: ({ ...props }) => (
                                <pre
                                    className="my-2 overflow-x-auto rounded-lg bg-[color:color-mix(in_oklab,var(--color-secondary)_78%,transparent)] p-2"
                                    {...props}
                                />
                            ),
                            ul: ({ ...props }) => <ul className="mb-2 list-disc pl-5 last:mb-0" {...props} />,
                            ol: ({ ...props }) => <ol className="mb-2 list-decimal pl-5 last:mb-0" {...props} />,
                            blockquote: ({ ...props }) => (
                                <blockquote
                                    className="my-2 border-l-2 border-[color:color-mix(in_oklab,var(--color-text-primary)_34%,transparent)] pl-3 italic"
                                    {...props}
                                />
                            ),
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                    {reactions.map((reaction) => (
                        <button
                            key={`${message.message_id}-${reaction.emojiId}`}
                            type="button"
                            onClick={() => onReact(message, reaction.emojiId, reaction.reactedByMe)}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-[0.1rem] text-xs transition-all ${
                                reaction.reactedByMe
                                    ? "border-[var(--color-primary)] bg-[color:color-mix(in_oklab,var(--color-primary)_24%,transparent)]"
                                    : "border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] bg-[color:color-mix(in_oklab,var(--color-secondary)_80%,transparent)]"
                            }`}
                        >
                            {reaction.emojiUrl ? (
                                <img src={reaction.emojiUrl} alt={reaction.emojiName || "emoji"} className="h-4 w-4 object-contain" />
                            ) : (
                                <span>{reaction.emojiUnicode || "🙂"}</span>
                            )}
                            <span>{reaction.count}</span>
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className="inline-flex items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] bg-[color:color-mix(in_oklab,var(--color-secondary)_80%,transparent)] px-2 py-[0.1rem] text-xs"
                    >
                        +
                    </button>
                </div>

                {showEmojiPicker && (
                    <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1 rounded-lg border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] p-2">
                        {availableEmojis.map((emoji) => (
                            <button
                                key={`${message.message_id}-${emoji.emoji_id}`}
                                type="button"
                                title={emoji.name}
                                onClick={() => {
                                    onReact(message, emoji.emoji_id, false);
                                    setShowEmojiPicker(false);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[color:color-mix(in_oklab,var(--color-primary)_22%,transparent)]"
                            >
                                {emoji.image_url ? (
                                    <img src={emoji.image_url} alt={emoji.name} className="h-6 w-6 object-contain" />
                                ) : (
                                    <span>{emoji.unicode || "🙂"}</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageCard;
