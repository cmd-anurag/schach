import { randomBytes } from "crypto";

/** Generate a random 6-char hex ID like "a3b9d0" */
function generateRoomID() {
  return randomBytes(3).toString("hex");
}

export function registerMatchmakingHandlers(io, socket, onlineUsers, rooms) {
  const username = socket.data.user.username;
    
  // incoming challenge
  //
  socket.on("challenge-user", ({ toUsername, color }) => {
    // ---- validation checks ----
    if (!toUsername || typeof toUsername !== "string") {
      socket.emit("challenge-error", { message: "Invalid username" });
      return;
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
    });

    console.log(`Challenge: ${username} → ${toUsername} (pref=${color})`);
  });

  //
  // accept challenge
  //
  socket.on("accept-challenge", ({ fromUsername, color }) => {
    const accepter = username;
    const challengerSocketId = onlineUsers.get(fromUsername);

    if (!challengerSocketId) {
      socket.emit("challenge-error", { message: "Challenger went offline" });
      return;
    }

    // determine colors
    let whiteUsername, blackUsername;

    if (color === "white") {
      whiteUsername = fromUsername;
      blackUsername = accepter;
    } else if (color === "black") {
      whiteUsername = accepter;
      blackUsername = fromUsername;
    } else {
      // random
      const arr = [fromUsername, accepter];
      arr.sort(() => Math.random() - 0.5);
      whiteUsername = arr[0];
      blackUsername = arr[1];
    }

    // unique room ID
    let roomID;
    do {
      roomID = generateRoomID();
    } while (rooms.has(roomID));

    // construct room object
    const room = {
      id: roomID,

      white: {
        username: whiteUsername,
        socketId: onlineUsers.get(whiteUsername) || null,
      },

      black: {
        username: blackUsername,
        socketId: onlineUsers.get(blackUsername) || null,
      },

      turn: "white",
    };

    // store
    rooms.set(roomID, room);

    // notify challenger
    io.to(challengerSocketId).emit("challenge-accepted", {
      roomID,
      color: whiteUsername === fromUsername ? "white" : "black",
      opponent: accepter,
    });

    // notify accepter
    socket.emit("challenge-accepted", {
      roomID,
      color: whiteUsername === accepter ? "white" : "black",
      opponent: fromUsername,
    });

    console.log(
      `ROOM CREATED: ${roomID} — ${whiteUsername}(white) vs ${blackUsername}(black)`
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
}
