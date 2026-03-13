const socket = io()
let localStream, peer, partnerId

const localVideo = document.getElementById("localVideo")
const remoteVideo = document.getElementById("remoteVideo")
const chatBox = document.getElementById("chatBox")
const chatInput = document.getElementById("chatInput")
const statusEl = document.getElementById("status")

// بدء الفيديو المحلي فورًا
async function startVideo(){
  try {
    localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
    localVideo.srcObject = localStream
  } catch(err){
    alert("Cannot access camera/microphone: " + err)
  }
}
startVideo()

// إنشاء PeerConnection موحد
function createPeerConnection(){
  const pc = new RTCPeerConnection({
    iceServers:[
      { urls: "stun:stun.l.google.com:19302" }
      // يمكنك إضافة TURN server هنا إذا أردت
    ]
  })

  if(localStream){
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream))
  }

  pc.ontrack = e => { remoteVideo.srcObject = e.streams[0] }

  pc.onicecandidate = e => {
    if(e.candidate && partnerId){
      socket.emit("signal",{ to: partnerId, signal:e.candidate })
    }
  }

  return pc
}

// عند العثور على شريك
socket.on("matched", async data=>{
  partnerId = data.id

  if(!localStream) await startVideo()

  if(peer) peer.close()
  peer = createPeerConnection()

  const offer = await peer.createOffer()
  await peer.setLocalDescription(offer)
  socket.emit("signal",{ to: partnerId, signal:offer })

  statusEl.innerText = "Partner found!"
})

// استقبال إشارات WebRTC
socket.on("signal", async data=>{
  if(data.signal.type==="offer"){
    if(!localStream) await startVideo()

    if(peer) peer.close()
    peer = createPeerConnection()
    partnerId = data.from

    await peer.setRemoteDescription(data.signal)
    const answer = await peer.createAnswer()
    await peer.setLocalDescription(answer)
    socket.emit("signal",{ to: data.from, signal:answer })
  } else if(data.signal.type==="answer"){
    await peer.setRemoteDescription(data.signal)
  } else {
    if(peer) await peer.addIceCandidate(data.signal)
  }
})

// الدردشة النصية
chatInput.addEventListener("keypress", e=>{
  if(e.key==="Enter" && chatInput.value.trim()!==""){
    socket.emit("chat-message", chatInput.value)
    chatBox.innerHTML += `<div class="self">You: ${chatInput.value}</div>`
    chatInput.value=""
    chatBox.scrollTop = chatBox.scrollHeight
  }
})

socket.on("chat-message", msg=>{
  chatBox.innerHTML += `<div class="partner">Partner: ${msg}</div>`
  chatBox.scrollTop = chatBox.scrollHeight
})