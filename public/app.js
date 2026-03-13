const socket = io()

let localStream
let peer
let partnerId

const localVideo = document.getElementById("localVideo")
const remoteVideo = document.getElementById("remoteVideo")

async function start(){

localStream = await navigator.mediaDevices.getUserMedia({
video:true,
audio:true
})

localVideo.srcObject = localStream

}

start()

socket.on("matched", async data => {

partnerId = data.id

peer = new RTCPeerConnection({

iceServers:[
{urls:"stun:stun.l.google.com:19302"}
]

})

localStream.getTracks().forEach(track=>{
peer.addTrack(track,localStream)
})

peer.ontrack = e=>{
remoteVideo.srcObject = e.streams[0]
}

peer.onicecandidate = e=>{
if(e.candidate){
socket.emit("signal",{
to:partnerId,
signal:e.candidate
})
}
}

const offer = await peer.createOffer()
await peer.setLocalDescription(offer)

socket.emit("signal",{
to:partnerId,
signal:offer
})

})