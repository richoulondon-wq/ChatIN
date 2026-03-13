const localVideo = document.getElementById("localVideo")
const remoteVideo = document.getElementById("remoteVideo")

// زر Mute
document.getElementById("muteBtn").onclick = ()=>{
  const tracks = localVideo.srcObject.getAudioTracks()
  tracks.forEach(track=>track.enabled = !track.enabled)
}

// زر Next
document.getElementById("nextBtn").onclick = ()=>{
  socket.emit("next")
  clearRemoteVideo()
  document.getElementById("status").innerText="Searching for partner..."
}

// زر Search Partner
document.getElementById("searchBtn").onclick = ()=>{
  socket.emit("next")
  clearRemoteVideo()
  document.getElementById("status").innerText="Searching for partner..."
}

// مسح الفيديو البعيد وإغلاق peer
function clearRemoteVideo(){
  remoteVideo.srcObject=null
  if(peer){ peer.close(); peer=null }
}