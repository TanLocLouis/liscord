# Project Roadmap

## Planned for v1.x.x
- ✅ Basic auth system.
- ✅ Servers, channels.
- ✅ Send text message.
- ✅ Implement socket.io
- ✅ Send emoji, GIF.
- Send media (static image, gif, video).
- Livestream room
    + Display capture
    + Using AI model (whisper) to transcribe (Japansese to English)
- ✅ Invite link.
- Push notification for message.
- Search old message (history).
- DM (Direct Message).

## Future
- Rate limitter.
- ✅ Limit the number of server and channel for each user.
- Admin Dashboard
    + Stats
    + Admin
- ChatBox
    + Client => Socket Gateway => Redis => API => Database.
    + API => EventStream => Socket Gateway => Client.
    + ✅ Using WebSocket to send/receive data.
- ✅ Push notification for message.
    + Using Redis as Event Stream.
- Implement E2EE to message.