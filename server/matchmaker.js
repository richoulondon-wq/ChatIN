let waitingUsers = []

function addUser(socket) {
  if(!waitingUsers.includes(socket)) waitingUsers.push(socket)
}

function removeUser(socket) {
  waitingUsers = waitingUsers.filter(u => u !== socket)
}

function findPartner(socket) {
  if(waitingUsers.length === 0) {
    addUser(socket)
    return null
  }

  const partner = waitingUsers.find(u => u !== socket)
  if(!partner) {
    addUser(socket)
    return null
  }

  waitingUsers = waitingUsers.filter(u => u !== partner)

  socket.partner = partner
  partner.partner = socket
  return partner
}

function nextPartner(socket) {
  if(socket.partner){
    socket.partner.partner = null
    socket.partner.emit("partner-left")
  }
  removeUser(socket)
  return findPartner(socket)
}

module.exports = { addUser, removeUser, findPartner, nextPartner }