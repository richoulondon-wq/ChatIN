// اتصال socket
const socket = io()

let localStream
let peer
let partnerId

const localVideo = document.getElementById("localVideo")
const remoteVideo = document.getElementById("remoteVideo")
const chatInput = document.getElementById("chatInput")
const chatBox = document.getElementById("chatBox")
const statusText = document.getElementById("status")

// TURN + STUN (Xirsys)
const ICE_SERVERS = [
{
urls: "stun:fr-turn7.xirsys.com"
},
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
]

// تشغيل الكاميرا
async function startCamera(){

try{

localStream = await navigator.mediaDevices.getUserMedia({
video:true,
audio:true
})

localVideo.srcObject = localStream

}catch(err){

alert("Camera / Microphone error: " + err)

}

}

startCamera()

// إنشاء اتصال WebRTC
function createPeer(){

peer = new RTCPeerConnection({
iceServers: ICE_SERVERS
})

// إرسال الفيديو للشريك
localStream.getTracks().forEach(track=>{
peer.addTrack(track, localStream)
})

// استقبال فيديو الشريك
peer.ontrack = event => {

remoteVideo.srcObject = event.streams[0]

}

// إرسال ICE
peer.onicecandidate = event => {

if(event.candidate && partnerId){

socket.emit("signal",{
to: partnerId,
signal: event.candidate
})

}

}

}

// عند العثور على شريك
socket.on("matched", async data=>{

partnerId = data.id

createPeer()

const offer = await peer.createOffer()

await peer.setLocalDescription(offer)

socket.emit("signal",{
to: partnerId,
signal: offer
})

statusText.innerText = "Connected to partner"

})

// استقبال الإشارات
socket.on("signal", async data=>{

if(data.signal.type === "offer"){

partnerId = data.from

createPeer()

await peer.setRemoteDescription(data.signal)

const answer = await peer.createAnswer()

await peer.setLocalDescription(answer)

socket.emit("signal",{
to: partnerId,
signal: answer
})

}

else if(data.signal.type === "answer"){

await peer.setRemoteDescription(data.signal)

}

else{

try{

await peer.addIceCandidate(data.signal)

}catch(e){
console.log("ICE error", e)
}

}

})

// الدردشة النصية
chatInput.addEventListener("keypress", e=>{

if(e.key === "Enter" && chatInput.value !== ""){

socket.emit("chat-message", chatInput.value)

chatBox.innerHTML += `<div class="self">You: ${chatInput.value}</div>`

chatInput.value = ""

chatBox.scrollTop = chatBox.scrollHeight

}

})

// استقبال الرسائل
socket.on("chat-message", msg=>{

chatBox.innerHTML += `<div class="partner">Partner: ${msg}</div>`

chatBox.scrollTop = chatBox.scrollHeight

})

// زر البحث
document.getElementById("searchBtn").onclick = ()=>{

socket.emit("next")

remoteVideo.srcObject = null

statusText.innerText = "Searching..."

}

// زر التالي
document.getElementById("nextBtn").onclick = ()=>{

socket.emit("next")

remoteVideo.srcObject = null

statusText.innerText = "Searching new partner..."

}

// كتم الصوت
document.getElementById("muteBtn").onclick = ()=>{

localStream.getAudioTracks().forEach(track=>{
track.enabled = !track.enabled
})

}

// عند خروج الشريك
socket.on("partner-disconnected", ()=>{

remoteVideo.srcObject = null

statusText.innerText = "Partner disconnected"

})
