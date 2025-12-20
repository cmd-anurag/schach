import { Room } from "../types/Game";
import { AppServer, PlayerSocket } from "../types/socketTypes";

// this function simply updates the clock based only on ELAPSED time since the last tick
function updateClock(room: Room) {
  if(!room.time.running || room.time.turnStartedAt === null) return;

  const now = Date.now();
  const elapsed = now - room.time.turnStartedAt;

  if(room.turn === 'white') {
    room.time.white = Math.max(0, room.time.white - elapsed);
  } else {
    room.time.black = Math.max(0, room.time.black - elapsed);
  }

  room.time.turnStartedAt = now;
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
        turnStartedAt: room.time.turnStartedAt ?? Date.now(),
      }
    });
    

    const opponentSocketId = playerColor === 'white'? room.black.socketID : room.white.socketID;
    if(opponentSocketId) {
      room.time.turnStartedAt = Date.now();
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
      
      // todo - game over if timeout happens
      if(room.time.white === 0) {
        io.to(roomID).emit('game-over', {
          winner: 'black',
          reason: 'timeout',
        })
        return;
      } else if(room.time.black === 0) {
        io.to(roomID).emit('game-over', {
          winner: 'white',
          reason: 'timeout',
        })
        return;
      }
      
      // increment
      if(room.turn === 'white') {
        room.time.white += room.time.increment;
      } else {
        room.time.black += room.time.increment;
      }


      room.chessInstance.move(move);
      room.moveHistory.push(move);

      const nextTurn = room.turn === 'white'? "black" : 'white';
      room.turn = nextTurn;
      
      // think about whether i set turnStartedAt of room again, its already updated in updateClock()
      room.time.turnStartedAt = Date.now();

      io.to(roomID).emit('move-made', {
        move,
        turn: nextTurn,
        byColor: playerColor,
        timeLeft: {
          white: room.time.white,
          black: room.time.black,
          turnStartedAt: room.time.turnStartedAt ?? Date.now(),
        }
      })

      // game over by checkmate 
      if(room.chessInstance.isCheckmate()) {
        
        io.to(roomID).emit('game-over', {
          winner: room.turn,
          reason: 'checkmate',
        })
        return;
      }

      // game draw
      if(room.chessInstance.isDraw()) {
        io.to(roomID).emit('game-over', {
          winner: 'draw',
          reason: 'draw',
        })
        return;
      }
      console.log(`Move in ${roomID} by ${username} (${playerColor}) — turn -> ${room.turn}`);
    } catch {
      socket.emit("move-error", {message: "Invalid move"});
    }
  });
}
