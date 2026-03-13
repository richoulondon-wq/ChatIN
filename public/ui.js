document.getElementById("nextBtn").onclick = ()=>{
  socket.emit("next")
  location.reload()
}

document.getElementById("muteBtn").onclick = ()=>{
  const tracks = localVideo.srcObject.getAudioTracks()
  tracks.forEach(track => track.enabled = !track.enabled)
}