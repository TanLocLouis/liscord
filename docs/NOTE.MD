# Problem
## This file log problems that I have encounterd on developing Liscord

- Trade-off
    + Store user_name in message: no need to join for each message, but what if user change thier user_name? The message still show old user_name
    + Store user_name separately: need to join for every message, but user_name will be newest.

- POST state
    + How to check wheather message is sent.
    + Can use Tanstack query.

- Parent-Child vs Sibling
    + Home component should contain (Sidebar, SidebarChannel, ChatBox) rather than Home => Sidebar => SidebarChannel => ChatBox.

- Clustering in Scylla
    + Using partition ((channel_id), created_at, message_id) to optimize.

- Minio Docker Container works like AWS S3
    + Avatar bucket should set Public Object, Private Bucket.

- useEffect render after component mount, so If I want to focus the conditional input, put it in useEffect.