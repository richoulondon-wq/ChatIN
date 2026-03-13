let waitingUsers = []

function add(socket){

if(!waitingUsers.includes(socket)){
waitingUsers.push(socket)
}

}

function remove(socket){

waitingUsers = waitingUsers.filter(u => u !== socket)

}

function findPartner(socket){

if(waitingUsers.length === 0){
add(socket)
return null
}

const partner = waitingUsers.shift()

if(partner === socket){
add(socket)
return null
}

socket.partner = partner
partner.partner = socket

return partner

}

function next(socket){

if(socket.partner){

socket.partner.partner = null
socket.partner.emit("partner-left")

}

remove(socket)

return findPartner(socket)

}

module.exports = {
add,
remove,
findPartner,
next
}