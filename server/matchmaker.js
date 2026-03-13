let waitingUsers = []

function addUser(socket){

waitingUsers.push(socket)

}

function removeUser(socket){

waitingUsers = waitingUsers.filter(user => user !== socket)

}

function getPartner(socket){

if(waitingUsers.length === 0){

addUser(socket)
return null

}

const partner = waitingUsers.shift()

if(partner === socket){

addUser(socket)
return null

}

socket.partner = partner
partner.partner = socket

return partner

}

function nextPartner(socket){

if(socket.partner){

socket.partner.partner = null
socket.partner.emit("partner-left")

}

removeUser(socket)

return getPartner(socket)

}

module.exports = {

addUser,
removeUser,
getPartner,
nextPartner

}