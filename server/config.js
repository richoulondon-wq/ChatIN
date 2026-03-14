// إعدادات المشروع العامة
module.exports = {
  iceServers: [
    { urls: [ "stun:fr-turn7.xirsys.com" ] },
    {
      username: "PKmUTMGQDR47aIaVvgtOExV9Fc0GuDJ4hi8cx1S8s_k_51Xr1jKjJRhffg_NGFFbAAAAAGm0rq5yaWNob3U=",
      credential: "84089ff6-1f3e-11f1-9321-2692ddfec16f",
      urls: [
        "turn:fr-turn7.xirsys.com:80?transport=udp",
        "turn:fr-turn7.xirsys.com:3478?transport=udp",
        "turn:fr-turn7.xirsys.com:80?transport=tcp",
        "turn:fr-turn7.xirsys.com:3478?transport=tcp",
        "turns:fr-turn7.xirsys.com:443?transport=tcp",
        "turns:fr-turn7.xirsys.com:5349?transport=tcp"
      ]
    }
  ],
  maxWaitingTime: 30,
  video: { width: 640, height: 480, fps: 30 }
}