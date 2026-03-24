-- Keyspace
CREATE KEYSPACE IF NOT EXISTS liscord
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE liscord;

-- Messages
CREATE TABLE IF NOT EXISTS messages_by_channel (
    channel_id uuid,
    created_at timestamp,
    message_id uuid,
    user_id uuid,
    content text,
    type text,
    updated_at timestamp,
    reply_to uuid,
    reply_to_content text,
    PRIMARY KEY ((channel_id), created_at, message_id)
) WITH CLUSTERING ORDER BY (created_at DESC, message_id ASC);

-- Reactions (main table)
CREATE TABLE IF NOT EXISTS reactions_by_message (
    message_id uuid,
    emoji_id text,
    user_id uuid,
    created_at timestamp,
    PRIMARY KEY ((message_id), emoji_id, user_id)
) WITH CLUSTERING ORDER BY (emoji_id ASC, user_id ASC);

-- Reaction counts
CREATE TABLE IF NOT EXISTS reaction_counts (
    message_id uuid,
    emoji_id text,
    count counter,
    PRIMARY KEY ((message_id), emoji_id)
);

-- Optional: user reactions
CREATE TABLE IF NOT EXISTS reactions_by_user (
    user_id uuid,
    message_id uuid,
    emoji_id text,
    created_at timestamp,
    PRIMARY KEY ((user_id), message_id, emoji_id)
);
