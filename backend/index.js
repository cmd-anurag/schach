import { Server } from "socket.io";
import {createServer} from 'http';


const httpserver = createServer();
const PORT = 3010;

const io = new Server(httpserver, {
  cors: {
    origin: "*",
  },
});

httpserver.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.IO server running on http://0.0.0.0:${PORT}`);
});

const rooms = new Map();

``

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on("join-room", (roomID) => {
    let room = rooms.get(roomID);

    if(!room) {
      room = {white: socket.id, black: null, turn: "white"};
      rooms.set(roomID, room);
      socket.join(roomID);
      socket.emit("player-color", "white");
      console.log(`Room created by ${socket.id} as White`);
    }
    else if(!room.black) {
      room.black = socket.id;
      socket.join(roomID);
      socket.emit("player-color", "black");
      io.to(roomID).emit('opponent-joined');
      console.log(`Room joined by ${socket.id} as Black`);
    } else {
      socket.emit("room-full");
      console.log(`${socket.id} tried to join a full room`);
    }

  })


  // the flow goes something like 
  // a socket in a room makes a move and emits a make-move 
  // server reacts to it, validates it and sends opponent-move to that room 
  socket.on("make-move", ({roomID, move, color}) => {
    const room = rooms.get(roomID);
    if(!room) return;

    if(room.turn !== color) {
      console.log(`${socket.id} , its not your turn`);
      return;
    }

    socket.to(roomID).emit("opponent-move", move);
    room.turn = color === "white"? "black" : "white";

  });

  socket.on("disconnect", () => {

    console.log(`Player disconnected: ${socket.id}`);
    for(const [roomID, room] of rooms.entries()) {
      if(room.white == socket.id || room.black == socket.id) {
        io.to(roomID).emit("opponent-left");
        rooms.delete(roomID);
        console.log(`Room ${roomID} deleted`);
      }
    }
  });
});