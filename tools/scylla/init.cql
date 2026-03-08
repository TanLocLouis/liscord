-- Create a keyspace (database)
CREATE KEYSPACE IF NOT EXISTS liscord
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE liscord;

-- Create table
CREATE TABLE IF NOT EXISTS messages_by_channel (
    channel_id uuid,
    created_at timestamp,
    message_id uuid,
    user_id uuid,
    content text,
    type text,
    updated_at timestamp,
    reply_to uuid,
    PRIMARY KEY ((channel_id), created_at, message_id)
) WITH CLUSTERING ORDER BY (created_at DESC, message_id ASC);
