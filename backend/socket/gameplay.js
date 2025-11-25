/**
 * socket/gameplay.js
 *
 * Gameplay handlers: join-room, make-move, leave-room
 *
 * Assumes rooms map contains room objects shaped like:
 * {
 *   id,
 *   white: { username, socketId | null },
 *   black: { username, socketId | null },
 *   turn: "white" | "black",
 *   moveHistory?: []  // optional array of moves
 * }
 */

export function registerGameplayHandlers(io, socket, rooms) {
  const username = socket.data.user.username;

  function getPlayerColor(room, username) {
    if (!room) return null;
    if (room.white && room.white.username === username) return "white";
    if (room.black && room.black.username === username) return "black";
    return null;
  }

  socket.on("join-room", (roomID) => {
    const room = rooms.get(roomID);

    if (!room) {
      socket.emit("invalid-room", { message: "Room not found" });
      return;
    }

    const playerColor = getPlayerColor(room, username);
    if (!playerColor) {
      socket.emit("not-a-participant", { message: "You are not a participant in this room" });
      return;
    }

    // attach current socket.id to correct slot and join the socket.io room
    if (playerColor === "white") {
      room.white.socketId = socket.id;
    } else {
      room.black.socketId = socket.id;
    }

    socket.join(roomID);
    socket.emit("player-color", playerColor);

    // ensure moveHistory exists
    if (!Array.isArray(room.moveHistory)) {
      room.moveHistory = [];
    }

    // send move history to the joining client so it can rebuild board
    socket.emit("move-history", { moves: room.moveHistory });

    // broadcast current room state to all participants (helps UI show who is connected/turn)
    io.to(roomID).emit("room-state", {
      white: room.white.username,
      black: room.black.username,
      turn: room.turn,
      whiteConnected: !!room.white.socketId,
      blackConnected: !!room.black.socketId,
    });

    console.log(`User ${username} joined room ${roomID} as ${playerColor}`);
  });

  socket.on("make-move", ({ roomID, move }) => {
    // NOTE: `move` shape is application-defined (e.g. {from, to, promotion})
    // We do minimal validation here: room exists, participant, correct turn.
    const room = rooms.get(roomID);
    if (!room) {
      socket.emit("move-error", { message: "Room not found" });
      return;
    }

    const playerColor = getPlayerColor(room, username);
    if (!playerColor) {
      socket.emit("move-error", { message: "You are not a participant in this room" });
      return;
    }

    if (room.turn !== playerColor) {
      socket.emit("move-error", { message: "Not your turn" });
      console.log(`Move rejected: ${username} tried to move out of turn in ${roomID}`);
      return;
    }

    // append to move history (useful for reconnect)
    if (!Array.isArray(room.moveHistory)) room.moveHistory = [];
    room.moveHistory.push(move);

    // forward move to opponent if they are connected
    const opponentSocketId = playerColor === "white" ? room.black.socketId : room.white.socketId;
    if (opponentSocketId) {
      io.to(opponentSocketId).emit("opponent-move", move);
    } else {
      // Opponent not connected — still OK: move is saved in moveHistory.
      socket.emit("opponent-offline", { message: "Opponent is not connected; move saved" });
      console.log(`Opponent offline in ${roomID} — move saved for ${username}`);
    }

    // flip turn
    room.turn = room.turn === "white" ? "black" : "white";

    // broadcast updated room state (who's turn it is now)
    io.to(roomID).emit("room-state", {
      white: room.white.username,
      black: room.black.username,
      turn: room.turn,
      whiteConnected: !!room.white.socketId,
      blackConnected: !!room.black.socketId,
    });

    console.log(`Move in ${roomID} by ${username} (${playerColor}) — turn -> ${room.turn}`);
  });

  // optional: allow graceful leaving of a room without disconnecting socket
  socket.on("leave-room", (roomID) => {
    const room = rooms.get(roomID);
    if (!room) {
      socket.emit("leave-error", { message: "Room not found" });
      return;
    }

    const playerColor = getPlayerColor(room, username);
    if (!playerColor) {
      socket.emit("leave-error", { message: "You are not a participant in this room" });
      return;
    }

    // clear socketId and leave socket.io room
    if (playerColor === "white") {
      room.white.socketId = null;
    } else {
      room.black.socketId = null;
    }

    socket.leave(roomID);

    io.to(roomID).emit("room-state", {
      white: room.white.username,
      black: room.black.username,
      turn: room.turn,
      whiteConnected: !!room.white.socketId,
      blackConnected: !!room.black.socketId,
    });

    socket.emit("left-room", { roomID });
    console.log(`${username} left room ${roomID}`);
  });
}
