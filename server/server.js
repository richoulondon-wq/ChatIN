const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const { v4: uuidv4 } = require("uuid")
const config = require("./config")
const matchmaker = require("./matchmaker")

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors:{ origin:"*" } })

app.use(express.static("public"))

io.on("connection", socket => {
  socket.userId = uuidv4()

  // محاولة مطابقة المستخدم فور الاتصال
  const partner = matchmaker.findPartner(socket)
  if(partner){
    socket.emit("matched",{id:partner.userId})
    partner.emit("matched",{id:socket.userId})
  }

  // إشارات WebRTC
  socket.on("signal", data => {
    io.to(data.to).emit("signal",{ from: socket.userId, signal: data.signal })
  })

  // الرسائل النصية
  socket.on("chat-message", msg => {
    if(socket.partner){
      socket.partner.emit("chat-message", msg)
    }
  })

  // الانتقال لشخص آخر
  socket.on("next", ()=> {
    const newPartner = matchmaker.nextPartner(socket)
    if(newPartner){
      socket.emit("matched",{id:newPartner.userId})
      newPartner.emit("matched",{id:socket.userId})
    }
  })

  // قطع الاتصال
  socket.on("disconnect", ()=> {
    matchmaker.removeUser(socket)
    if(socket.partner) socket.partner.emit("partner-left")
  })
})

server.listen(config.PORT, () => console.log("Server running on port "+config.PORT))