document.getElementById("nextBtn").onclick=()=>{

location.reload()

}

document.getElementById("muteBtn").onclick=()=>{

const tracks = localVideo.srcObject.getAudioTracks()

tracks.forEach(track=>{

track.enabled = !track.enabled

})

}