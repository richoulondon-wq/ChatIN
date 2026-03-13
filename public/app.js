const socket = io()

let localStream
let peer
let partnerId

const localVideo = document.getElementById("localVideo")
const remoteVideo = document.getElementById("remoteVideo")
const status = document.getElementById("status")

async function init(){

localStream = await navigator.mediaDevices.getUserMedia({
video:true,
audio:true
})

localVideo.srcObject = localStream

}

init()

socket.on("matched",async data=>{

partnerId = data.id

status.innerText = "Connected"

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

socket.on("signal",async data=>{

if(data.signal.type==="offer"){

peer = new RTCPeerConnection()

localStream.getTracks().forEach(track=>{
peer.addTrack(track,localStream)
})

peer.ontrack = e=>{
remoteVideo.srcObject = e.streams[0]
}

await peer.setRemoteDescription(data.signal)

const answer = await peer.createAnswer()

await peer.setLocalDescription(answer)

socket.emit("signal",{

to:data.from,
signal:answer

})

}

else if(data.signal.type==="answer"){

await peer.setRemoteDescription(data.signal)

}

else{

peer.addIceCandidate(data.signal)

}

})