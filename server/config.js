module.exports = {

PORT: 3000,

ICE_SERVERS: [
    {
        urls: "stun:stun.l.google.com:19302"
    },
    {
        urls: "stun:stun1.l.google.com:19302"
    }
],

MAX_WAITING_USERS: 1000,

MATCH_DELAY: 500

}