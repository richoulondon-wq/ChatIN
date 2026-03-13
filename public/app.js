const socket = io()
let localStream, peer, partnerId

const localVideo = document.getElementById("localVideo")
const remoteVideo = document.getElementById("remoteVideo")
const chatBox = document.getElementById("chatBox")
const chatInput = document.getElementById("chatInput")

async function startVideo(){
  localStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true })
  localVideo.srcObject = localStream
}
startVideo()

socket.on("matched", async data => {
  partnerId = data.id
  const pc = new RTCPeerConnection({ iceServers: [{urls:"stun:stun.l.google.com:19302"}] })
  peer = pc

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream))
  pc.ontrack = e => { remoteVideo.srcObject = e.streams[0] }
  pc.onicecandidate = e => { if(e.candidate) socket.emit("signal",{ to:partnerId, signal:e.candidate }) }

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  socket.emit("signal",{ to:partnerId, signal:offer })
})

socket.on("signal", async data => {
  if(data.signal.type === "offer"){
    peer = new RTCPeerConnection({ iceServers: [{urls:"stun:stun.l.google.com:19302"}] })
    localStream.getTracks().forEach(track=>peer.addTrack(track, localStream))
    peer.ontrack = e=>{ remoteVideo.srcObject = e.streams[0] }
    await peer.setRemoteDescription(data.signal)
    const answer = await peer.createAnswer()
    await peer.setLocalDescription(answer)
    socket.emit("signal",{ to:data.from, signal:answer })
  } else if(data.signal.type === "answer"){
    await peer.setRemoteDescription(data.signal)
  } else {
    await peer.addIceCandidate(data.signal)
  }
})

// الدردشة النصية
chatInput.addEventListener("keypress", e => {
  if(e.key === "Enter" && chatInput.value.trim() !== ""){
    socket.emit("chat-message", chatInput.value)
    chatBox.innerHTML += `<div class="self">You: ${chatInput.value}</div>`
    chatInput.value=""
    chatBox.scrollTop = chatBox.scrollHeight
  }
})

socket.on("chat-message", msg => {
  chatBox.innerHTML += `<div class="partner">Partner: ${msg}</div>`
  chatBox.scrollTop = chatBox.scrollHeight
})