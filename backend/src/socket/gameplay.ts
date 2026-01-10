import { Room } from "../types/Game";
import { AppServer, PlayerSocket } from "../types/socketTypes";

// this function simply updates the clock based only on ELAPSED time since the last turn started at
function updateClock(room: Room) {
  if(!room.time.running || room.time.turnStartedAt === null) return;

  const now = Date.now();
  const elapsed = now - room.time.turnStartedAt;

  if(room.turn === 'white') {
    room.time.white = Math.max(0, room.time.white - elapsed);
  } else {
    room.time.black = Math.max(0, room.time.black - elapsed);
  }
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
    room.time.turnStartedAt = Date.now();

    socket.emit('game-start', {
      roomID,
      myColor: playerColor,
      opponent: playerColor === 'white'? room.black.username : room.white.username,
      turn: room.turn,
      moveHistory: room.chessInstance.history(),
      opponentConnected: playerColor === 'white'? !!room.black.socketID : !!room.white.socketID,
      timeLeft: {
        white: room.time.white,
        black: room.time.black,
        turnStartedAt: room.time.turnStartedAt,
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
    if(room.gameFinished) return;

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
      
      
      if(room.time.white === 0) {
        io.to(roomID).emit('game-over', {
          winner: 'black',
          reason: 'timeout',
        })

        room.gameFinished = true;
        return;

      } else if(room.time.black === 0) {
        io.to(roomID).emit('game-over', {
          winner: 'white',
          reason: 'timeout',
        });

        room.gameFinished = true;
        return;
      }
      
      // increment
      if(room.turn === 'white') {
        room.time.white += room.time.increment;
      } else {
        room.time.black += room.time.increment;
      }


      room.chessInstance.move(move);

      const nextTurn = room.turn === 'white'? "black" : 'white';
      room.turn = nextTurn;
      
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
          winner: room.turn === 'black'? 'white' : 'black',
          reason: 'checkmate',
        });
        room.gameFinished = true;
        return;
      }

      // game draw
      if(room.chessInstance.isDraw()) {
        io.to(roomID).emit('game-over', {
          winner: 'draw',
          reason: 'draw',
        });
        room.gameFinished = true;
        return;
      }

      // after game over send some kind of signal to server too to do post game stuff like saving it to DB
      console.log(`Move in ${roomID} by ${username} (${playerColor}) — turn -> ${room.turn}`);
    } catch {
      socket.emit("move-error", {message: "Invalid move"});
    }
  });

  socket.on('game-timeout', ({roomID}) => {

    const room = rooms.get(roomID);
    if(!room) {
      return;
    }
    if(room.gameFinished) return;

    let playerColor = null;
    if(room.white.username === username) playerColor = "white";
    else if(room.black.username === username) playerColor = "black";
    if (!playerColor) {
      return;
    }
    updateClock(room);
    if(room.time.white === 0) {
      io.to(roomID).emit('game-over', {winner: 'black', reason: 'timeout'});
      room.gameFinished = true;
    } else if(room.time.black === 0) {
      io.to(roomID).emit('game-over', {winner: 'white', reason: 'timeout'});
      room.gameFinished = true;
    }
  });

  socket.on('resign-game', ({roomID}) => {
    const room = rooms.get(roomID);
    if(!room) return;
    if(room.gameFinished) return;

    let playerColor = null;
    if(room.white.username === username) playerColor = "white";
    else if(room.black.username === username) playerColor = "black";
    if (!playerColor) {
      return;
    }

    updateClock(room);

    if(playerColor === 'white') {
      io.to(roomID).emit('game-over', {winner: 'black', reason: 'resignation'});
      room.gameFinished = true;
    } else if(playerColor === 'black') {
      io.to(roomID).emit('game-over', {winner: 'white', reason: 'resignation'});
      room.gameFinished = true;
    }

    console.log(playerColor + ' resigned the game.');
  })
}
