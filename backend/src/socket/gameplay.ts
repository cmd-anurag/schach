import { Room } from "../types/Game";
import { AppServer, PlayerSocket } from "../types/socketTypes";

export function registerGameplayHandlers(io: AppServer, socket: PlayerSocket, rooms: Map<string, Room>) {
  const username = socket.data.user.username;

  // handler for client trying to join a room 
  socket.on("join-room", ({roomID}) => {
    const room = rooms.get(roomID);

    if (!room) {
      socket.emit("room-error", { message: "Room not found" });
      return;
    }

    let playerColor: 'white' | 'black' = 'white';
    if(room.white.username === username) {
      playerColor = 'white';
      room.white.socketID = socket.id;
    } else if(room.black.username === username) {
      playerColor = 'black';
      room.black.socketID = socket.id;
    }

    if(!playerColor) {
      socket.emit('room-error', {message: 'You are not in this game'});
      return;
    }

    socket.join(roomID);
    socket.emit('game-start', {
      roomID,
      myColor: playerColor,
      opponent: playerColor === 'white'? room.black.username : room.white.username,
      turn: room.turn,
      moveHistory: room.moveHistory,
      opponentConnected: playerColor === 'white'? !!room.black.socketID : !!room.white.socketID,
    });

    const opponentSocketId = playerColor === 'white'? room.black.socketID : room.white.socketID;
    if(opponentSocketId) {
      io.to(opponentSocketId).emit('opponent-connected');
    }
    console.log(`User ${username} joined room ${roomID} as ${playerColor}`);
  });

  socket.on("make-move", ({ roomID, move }) => {
    const room = rooms.get(roomID);
    if (!room) {
      socket.emit("room-error", { message: "Room not found" });
      return;
    }
    let playerColor = null;
    if(room.white.username === username) playerColor = "white";
    else if(room.black.username === username) playerColor = "black";

    if (!playerColor) {
      socket.emit("move-error", { message: "Not a participant" });
      return;
    }

    if(room.turn !== playerColor) {
      socket.emit("move-error", {message: "Not your turn"});
      return;
    }
    room.moveHistory.push(move);
    const nextTurn = room.turn === 'white'? "black" : 'white';
    room.turn = nextTurn;

    io.to(roomID).emit('move-made', {
      move,
      turn: nextTurn,
      byColor: playerColor
    })
    console.log(`Move in ${roomID} by ${username} (${playerColor}) — turn -> ${room.turn}`);
  });
}

// TODO MIGRATE BACKEND TO TS [DONE] AND ADD A CHESS JS INSTANCE TO EACH ROOM FOR VALIDATION [validation left]