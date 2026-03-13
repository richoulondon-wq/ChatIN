const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const { v4: uuidv4 } = require("uuid")

const config = require("./config")
const matchmaker = require("./matchmaker")

const app = express()
const server = http.createServer(app)

const io = new Server(server,{
cors:{
origin:"*"
}
})

app.use(express.static("public"))

io.on("connection", socket => {

socket.userId = uuidv4()

const partner = matchmaker.findPartner(socket)

if(partner){

socket.emit("matched",{id:partner.id})
partner.emit("matched",{id:socket.id})

}

socket.on("signal", data => {

io.to(data.to).emit("signal",{
from: socket.id,
signal: data.signal
})

})

socket.on("next", ()=>{

const newPartner = matchmaker.next(socket)

if(newPartner){

socket.emit("matched",{id:newPartner.id})
newPartner.emit("matched",{id:socket.id})

}

})

socket.on("disconnect", ()=>{

matchmaker.remove(socket)

if(socket.partner){
socket.partner.emit("partner-left")
}

})

})

server.listen(config.PORT, ()=>{

console.log("Server running on port " + config.PORT)

})