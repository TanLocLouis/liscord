## Liscord - Feature List

### High Priority
- Basic auth system.
- Servers, channels.
- Send text message.
- Send media (static image, gif, video)
- Livestream room
    + Display capture
    + Using AI model (whisper) to transcribe (Japansese to English)

## Future
- Admin Dashboard
    + Stats
    + Admini

- ChatBox
    + Client => Socket Gateway => Redis => API => Database
    + API => EventStream => Socket Gateway => Client 
    + Using WebSocket to send/receive data
    + Using Redis as Event Stream