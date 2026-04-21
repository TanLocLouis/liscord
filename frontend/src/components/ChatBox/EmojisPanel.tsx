import { useState } from 'react';

type ServerEmoji = {
    emoji_id: string;
    name: string;
    image_url: string | null;
    unicode: string | null;
};

interface EmojisPanelProps {
    availableEmojis: ServerEmoji[];
    onSendEmoji: (emojiUrl: string | null) => void;
}

function EmojisPanel( { availableEmojis, onSendEmoji }: EmojisPanelProps ) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="inline-flex w-10 h-10 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] bg-[color:color-mix(in_oklab,var(--color-secondary)_80%,transparent)] px-2 py-[0.1rem] text-xs"
            >
                +
            </button>

            {/* Should I send image_url instead of emoji_id? */}
            {/* Just treat the emoji as an image */}
            {/* LMAO */}
            {/* I am too lazy to implement loading emoji from emoji_id */}
            {/* It midnight now*/}
            {showEmojiPicker && (
                <div>
                    {availableEmojis.map((emoji) => (
                        <button
                            key={emoji.emoji_id}
                            type="button"
                            title={emoji.name}
                            className="text-2xl p-1 rounded hover:bg-[color:color-mix(in_oklab,var(--color-secondary)_20%,transparent)]"
                            onClick={() => {
                                onSendEmoji(emoji.image_url);
                                setShowEmojiPicker(false);
                            }}
                        >
                            {emoji.unicode ? (
                                <span style={{ fontSize: '1.5rem' }}>{emoji.unicode}</span>
                            ) : emoji.image_url ? (
                                <img src={emoji.image_url} alt={emoji.name} style={{ width: '1.5rem', height: '1.5rem' }} />
                            ) : (
                                <span>{emoji.name}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default EmojisPanel;