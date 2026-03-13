const socket = io()
let localStream, peer, partnerId

const localVideo = document.getElementById("localVideo")
const remoteVideo = document.getElementById("remoteVideo")
const chatBox = document.getElementById("chatBox")
const chatInput = document.getElementById("chatInput")
const statusEl = document.getElementById("status")

// بدء الفيديو المحلي فورًا
async function startVideo(){
  localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
  localVideo.srcObject = localStream
}
startVideo()

// إنشاء PeerConnection موحد مع ICE و ontrack
function createPeerConnection(remoteEl){
  const pc = new RTCPeerConnection({
    iceServers: [{ urls:"stun:stun.l.google.com:19302" }]
  })

  // إضافة المسارات المحلية
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream))

  // استقبال الفيديو من الشريك مباشرة
  pc.ontrack = e => { remoteEl.srcObject = e.streams[0] }

  // إرسال ICE candidates للشريك
  pc.onicecandidate = e => {
    if(e.candidate && partnerId){
      socket.emit("signal",{ to: partnerId, signal: e.candidate })
    }
  }

  return pc
}

// عند العثور على شريك
socket.on("matched", async data => {
  partnerId = data.id

  if(peer) peer.close() // اغلاق أي اتصال قديم
  peer = createPeerConnection(remoteVideo)

  // إنشاء offer وإرسالها للشريك
  const offer = await peer.createOffer()
  await peer.setLocalDescription(offer)
  socket.emit("signal",{ to: partnerId, signal: offer })

  statusEl.innerText = "Partner found!"
})

// استقبال إشارات WebRTC
socket.on("signal", async data => {
  if(data.signal.type === "offer"){
    // الطرف الثاني ينشئ PeerConnection فور استقبال offer
    if(peer) peer.close()
    peer = createPeerConnection(remoteVideo)
    partnerId = data.from

    await peer.setRemoteDescription(data.signal)
    const answer = await peer.createAnswer()
    await peer.setLocalDescription(answer)
    socket.emit("signal",{ to: data.from, signal: answer })
  } else if(data.signal.type === "answer"){
    await peer.setRemoteDescription(data.signal)
  } else {
    // ICE candidate
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