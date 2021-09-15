const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app = express();
const server = http.createServer(app); // if we dont do this express done this behind the scene,we are doing thisto setup socket.io
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectorypath = path.join(__dirname, "../public");

app.use(express.static(publicDirectorypath));

let count = 0;

// server(emit) ->client(recieve) - countUpdated
// client(emit) ->server(recieve) - incremented
var mss = "welcome!";

io.on("connection", (socket) => {
  console.log("new websocket connection");

  // socket.emit('countUpdated',count)  //send an event to the client

  // //recieve event from the server
  // socket.on('increment',()=>{
  //     count++
  // // socket.emit('countUpdated',count)  //emit to the single connection
  // io.emit('countUpdated',count) //emit to every single connection

  // })

  // socket.emit("Message", generateMessage('Welcome!!'));
  // socket.on("sendMessage", (message) => {
  //   io.emit("Message", message);
  // });

  socket.on('join',({username,room},callback)=>{
    const {error,user}=addUser({id:socket.id,username,room})
    if (error) {
       return callback(error)
    }

    socket.join(user.room)
    socket.emit("Message", generateMessage('Admin','Welcome!!'));
    socket.broadcast.to(user.room).emit("Message", generateMessage('New User',`${user.username}  has joined!`)); // it will emit to every single connection except itself(self) to  a specific room
    io.to(user.room).emit('roomData',{
      room:user.room,
      users:getUsersInRoom(user.room)
    })
    callback()
  })

  //acknlowdgment has been sent callback //reciver send the ackngment
  socket.on("sendMessage", (message,callback) => {
     const user=getUser(socket.id)
    const filter=new Filter()
    if(filter.isProfane(message)){
      return callback("profanity is not allowed")
    }
    io.to(user.room).emit("Message", generateMessage(user.username,message));
    callback()
  });

  // socket.broadcast.emit("Message", generateMessage("a new user has joined!")); // it will emit to every single connection except itself(self)

  socket.on('sendLocation',(coords,callback)=>{
    // io.emit('Message',`location: ${coords.latitude} , ${coords.longitude}`)
    const user=getUser(socket.id)
    io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    
    callback()
  })

  // when a connection disconnect it will run
  socket.on("disconnect", () => {
    const user=removeUser(socket.id)
    if (user) {
      io.to(user.room).emit("Message", generateMessage('Logout',`${user.username} has left!`));
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
  });
});

server.listen(port, () => {
  console.log(`server is on ${port}! port`);
});
