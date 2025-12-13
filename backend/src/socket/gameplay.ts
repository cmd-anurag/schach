import { Room } from "../types/Game";
import { AppServer, PlayerSocket } from "../types/socketTypes";

// this function simply updates the clock based only on ELAPSED time since the last tick
function updateClock(room: Room) {
  if(!room.time.running || !room.time.lastTick) return;

  const now = Date.now();
  const elapsed = now - room.time.lastTick;

  if(room.turn === 'white') {
    room.time.white = Math.max(0, room.time.white - elapsed);
  } else {
    room.time.black = Math.max(0, room.time.black - elapsed);
  }

  room.time.lastTick = now;
}

export function registerGameplayHandlers(io: AppServer, socket: PlayerSocket, rooms: Map<string, Room>) {
  const username = socket.data.user.username;

  // handler for client trying to join a room 
  socket.on("join-room", ({roomID}) => {
    const room = rooms.get(roomID);

    if (!room) {
      socket.emit("room-error", { message: "Room not found" });
      return;
    }

    let playerColor: 'white' | 'black' | null = null;
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
    updateClock(room);
    socket.emit('game-start', {
      roomID,
      myColor: playerColor,
      opponent: playerColor === 'white'? room.black.username : room.white.username,
      turn: room.turn,
      moveHistory: room.moveHistory,
      opponentConnected: playerColor === 'white'? !!room.black.socketID : !!room.white.socketID,
      timeLeft: {
        white: room.time.white,
        black: room.time.black,
      }
    });
    

    const opponentSocketId = playerColor === 'white'? room.black.socketID : room.white.socketID;
    if(opponentSocketId) {
      room.time.lastTick = Date.now();
      room.time.running = true;
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
    try {
      updateClock(room);
      
      if(room.turn === 'white') {
        room.time.white += room.time.increment;
      } else {
        room.time.black += room.time.increment;
      }

      // todo- game over if timeout happens

      room.chessInstance.move(move);
      room.moveHistory.push(move);


      const nextTurn = room.turn === 'white'? "black" : 'white';
      room.turn = nextTurn;
  
      io.to(roomID).emit('move-made', {
        move,
        turn: nextTurn,
        byColor: playerColor,
        timeLeft: {
          white: room.time.white,
          black: room.time.black,
        }
      })
      console.log(`Move in ${roomID} by ${username} (${playerColor}) — turn -> ${room.turn}`);
    } catch {
      socket.emit("move-error", {message: "Invalid move"});
    }
  });
}
