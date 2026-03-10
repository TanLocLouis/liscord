import timeAgo from "@utils/timeAgo.js";
    
export type ChatMessage = {
    message_id: string;
    user_name: string;
    avatar: string;
    created_at: string;
    content: string;
    mine?: boolean;
};

interface MessageCardProps {
    message: ChatMessage;
}

const MessageCard = ({ message }: MessageCardProps) => {
    return (
        <article
            className={`grid grid-cols-[40px_1fr] gap-3 items-start px-[0.7rem] py-[0.6rem] border rounded-xl bg-[color:color-mix(in_oklab,color-mix(in_oklab,var(--color-secondary)_72%,var(--color-primary-soft)_28%)_86%,transparent)] ${
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
            />

            <div>
                <div className="flex items-baseline gap-2">
                    <strong className="text-[0.95rem] text-[var(--color-text-primary)]">{message.user_name}</strong>
                    <time className="text-xs opacity-70 text-[var(--color-text-primary)]">{timeAgo(message.created_at)}</time>
                </div>
                <p className="mt-[0.35rem] content-[0.9rem] leading-[1.45] text-[var(--color-text-primary)]">{message.content}</p>
            </div>
        </article>
    );
};

export default MessageCard;
