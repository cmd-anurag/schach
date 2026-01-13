import { AppServer, PlayerSocket } from "../types/socketTypes";
import { Game } from "../types/Game";
import { Chess } from "chess.js";
import { randomBytes } from "crypto";
import { addGame } from "../game/store";

// Generate a UUID v4 128-bit ID
function generateGameID() {
  return randomBytes(16).toString('base64url');
}

export function registerMatchmakingHandlers(io: AppServer, socket: PlayerSocket, onlineUsers: Map<string, string>) {
  const username = socket.data.user.username;
    
  // incoming challenge
  //
  socket.on("challenge-user", ({ toUsername, color, time, increment }) => {
    // ---- validation checks ----
    if (!toUsername || typeof toUsername !== "string") {
      socket.emit("challenge-error", { message: "Invalid username" });
      return;
    }

    if(time <= 0 || increment < 0) {
      socket.emit('challenge-error', {message: 'Invalid time control'});
    }

    if (toUsername === username) {
      socket.emit("challenge-error", { message: "You cannot challenge yourself" });
      return;
    }

    if (!["white", "black", "random"].includes(color)) {
      socket.emit("challenge-error", { message: "Invalid color option" });
      return;
    }

    const targetSocketId = onlineUsers.get(toUsername);

    if (!targetSocketId) {
      socket.emit("challenge-error", { message: "User is not online" });
      return;
    }

    // ---- forward challenge ----
    io.to(targetSocketId).emit("incoming-challenge", {
      fromUsername: username,
      color,
      time,
      increment,
    });

    console.log(`Challenge: ${username} → ${toUsername} (pref=${color})`);
  });

  //
  // accept challenge
  //
  socket.on("accept-challenge", ({ fromUsername, color, time, increment }) => {

    if(time <= 0 || increment < 0) {
      socket.emit('challenge-error', {message: 'Invalid time control'});
    }

    const accepter = username;
    const challengerSocketId = onlineUsers.get(fromUsername);

    if (!challengerSocketId) {
      socket.emit("challenge-error", { message: "Challenger went offline" });
      return;
    }

    // determine colors
    let whiteUsername: string = fromUsername;
    let blackUsername: string = accepter;

    switch(color) {
      case "white":
        whiteUsername = fromUsername;
        blackUsername = accepter;
        break;
      case "black":
        whiteUsername = accepter;
        blackUsername = fromUsername;
        break;
      case "random":
      default:
        if(Math.random() < 0.5) {
          whiteUsername = fromUsername;
          blackUsername = accepter;
        } else {
          whiteUsername = accepter;
          blackUsername = fromUsername;
        }
        break;
    }

    // unique game ID
    const gameID = generateGameID();

    // construct game object
    const game: Game = {
      id: gameID,

      white: {
        username: whiteUsername,
        socketID: onlineUsers.get(whiteUsername) || null,
      },

      black: {
        username: blackUsername,
        socketID: onlineUsers.get(blackUsername) || null,
      },

      turn: "white",
      chessInstance: new Chess(),
      gameFinished: false,
      time: {
        white: time * 1000 * 60, // storeing time in ms instead of minutes received from client
        black: time * 1000 * 60,
        increment: increment * 1000, // increment received in seconds from client
        turnStartedAt: null,
        running: false,
      }
    };

    // store
    addGame(gameID, game);

    // notify challenger
    io.to(challengerSocketId).emit("challenge-accepted", {
      gameID,
      color: whiteUsername === fromUsername ? "white" : "black",
      opponent: accepter,
    });

    // notify accepter
    socket.emit("challenge-accepted", {
      gameID,
      color: whiteUsername === accepter ? "white" : "black",
      opponent: fromUsername,
    });

    console.log(
      `GAME CREATED: ${gameID} — ${whiteUsername}(white) vs ${blackUsername}(black)`
    );
  });

  //
  // reject challenge
  //
  socket.on("reject-challenge", ({ fromUsername }) => {
    const challengerSocketId = onlineUsers.get(fromUsername);

    if (challengerSocketId) {
      io.to(challengerSocketId).emit("challenge-rejected", {
        by: username,
      });
    }

    console.log(`Challenge rejected: ${username} → ${fromUsername}`);
  });

  // get online users
  socket.on("get-online-users" ,() => {
    socket.emit('online-users', {users: Array.from(onlineUsers.keys())});
  })
}
