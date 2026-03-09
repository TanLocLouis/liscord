export type ChatMessage = {
    id: string;
    author: string;
    avatar: string;
    time: string;
    text: string;
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
            <span
                className="w-10 h-10 rounded-[10px] inline-flex items-center justify-center font-bold text-[0.95rem] text-[var(--color-secondary)] bg-[linear-gradient(155deg,var(--color-primary),var(--color-info))]"
                aria-hidden="true"
            >
                {message.avatar}
            </span>

            <div>
                <div className="flex items-baseline gap-2">
                    <strong className="text-[0.95rem] text-[var(--color-text-primary)]">{message.author}</strong>
                    <time className="text-xs opacity-70 text-[var(--color-text-primary)]">{message.time}</time>
                </div>
                <p className="mt-[0.35rem] text-[0.9rem] leading-[1.45] text-[var(--color-text-primary)]">{message.text}</p>
            </div>
        </article>
    );
};

export default MessageCard;
