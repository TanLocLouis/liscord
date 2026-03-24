import { type ChatMessage } from "./MessageCard.js";

type ServerEmoji = {
    emoji_id: string;
    name: string;
    image_url: string | null;
    unicode: string | null;
};

type MessageReaction = {
    emojiId: string;
    emojiName: string | null;
    emojiUrl: string | null;
    emojiUnicode: string | null;
    count: number;
    reactedByMe: boolean;
};

export const updateMessagesWithReaction = (
    messages: ChatMessage[],
    messageId: string,
    emojiId: string,
    shouldAdd: boolean,
    affectMine: boolean,
    serverEmojis: ServerEmoji[],
): ChatMessage[] => messages.map((message) => {
    if (message.message_id !== messageId) {
        return message;
    }

    const existingReactions = message.reactions || [];
    const current = existingReactions.find((reaction) => reaction.emojiId === emojiId);

    if (shouldAdd) {
        if (current) {
            return {
                ...message,
                reactions: existingReactions.map((reaction) => (
                    reaction.emojiId === emojiId
                        ? { ...reaction, count: reaction.count + 1, reactedByMe: affectMine ? true : reaction.reactedByMe }
                        : reaction
                )),
            };
        }

        const emojiMeta = serverEmojis.find((emoji) => emoji.emoji_id === emojiId);
        const nextReaction: MessageReaction = {
            emojiId,
            emojiName: emojiMeta?.name || null,
            emojiUrl: emojiMeta?.image_url || null,
            emojiUnicode: emojiMeta?.unicode || null,
            count: 1,
            reactedByMe: affectMine,
        };

        return {
            ...message,
            reactions: [...existingReactions, nextReaction],
        };
    }

    if (!current) {
        return message;
    }

    return {
        ...message,
        reactions: existingReactions
            .map((reaction) => (
                reaction.emojiId === emojiId
                    ? { ...reaction, count: reaction.count - 1, reactedByMe: affectMine ? false : reaction.reactedByMe }
                    : reaction
            ))
            .filter((reaction) => reaction.count > 0),
    };
});
