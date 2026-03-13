const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const { v4: uuidv4 } = require("uuid")

const app = express()
const server = http.createServer(app)

const io = new Server(server)

app.use(express.static("public"))

let waitingUsers = []

function findPartner(socket){

if(waitingUsers.length > 0){

const partner = waitingUsers.shift()

socket.partner = partner
partner.partner = socket

socket.emit("matched",{id:partner.id})
partner.emit("matched",{id:socket.id})

}else{

waitingUsers.push(socket)

}

}

io.on("connection",socket=>{

socket.id = uuidv4()

findPartner(socket)

socket.on("signal",data=>{

io.to(data.to).emit("signal",{
from:socket.id,
signal:data.signal
})

})

socket.on("next",()=>{

if(socket.partner){

socket.partner.emit("partner-left")
socket.partner.partner = null

}

findPartner(socket)

})

socket.on("disconnect",()=>{

if(socket.partner){

socket.partner.emit("partner-left")

}

waitingUsers = waitingUsers.filter(u=>u!==socket)

})

})

server.listen(3000,()=>{

console.log("Server running on 3000")

})