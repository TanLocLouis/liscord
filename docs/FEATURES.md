# Project Roadmap

## Planned for v1.x.x
- Basic auth system.
- Servers, channels.
- Send text message.
- Implement socket.io
- Send emoji, GIF.
- Send media (static image, gif, video).
- Livestream room
    + Display capture
    + Using AI model (whisper) to transcribe (Japansese to English)
- Invite link.

## Future
- Rate limitter.
- Limit the number of server and channel for each user.
- Admin Dashboard
    + Stats
    + Admin
- ChatBox
    + Client => Socket Gateway => Redis => API => Database.
    + API => EventStream => Socket Gateway => Client.
    + Using WebSocket to send/receive data.
    + Using Redis as Event Stream.