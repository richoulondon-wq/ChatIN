// اتصال Socket.IO
const socket = io()

let localStream, peer, partnerId

// عناصر الفيديو والدردشة
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

// إنشاء PeerConnection مع Xirsys TURN/STUN
function createPeerConnection(){
  const pc = new RTCPeerConnection({
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
    ]
  })

  // إضافة مسارات الفيديو والصوت المحلي
  if(localStream){
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream))
  }

  // استقبال فيديو الشريك
  pc.ontrack = e => { remoteVideo.srcObject = e.streams[0] }

  // إرسال ICE candidates
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

  // الطرف الأول ينشئ offer
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
    socket.emit("signal",{ to:data.from, signal:answer })
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

// أزرار التحكم (Mute / Next / Search)
document.getElementById("muteBtn").onclick = ()=>{
  if(localVideo.srcObject){
    localVideo.srcObject.getAudioTracks().forEach(track => track.enabled = !track.enabled)
  }
}

function clearRemoteVideo(){
  remoteVideo.srcObject = null
  if(peer){
    peer.close()
    peer = null
  }
}

document.getElementById("nextBtn").onclick = ()=>{
  socket.emit("next")
  clearRemoteVideo()
  statusEl.innerText = "Searching for partner..."
}

document.getElementById("searchBtn").onclick = ()=>{
  socket.emit("next")
  clearRemoteVideo()
  statusEl.innerText = "Searching for partner..."
}
