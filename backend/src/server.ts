import { Server } from "socket.io";
import {createServer} from 'http';
import {authMiddleware} from "./socket/auth";
import {registerMatchmakingHandlers} from "./socket/matchmaking";
import {registerGameplayHandlers} from "./socket/gameplay";
import {registerDisconnectHandlers} from "./socket/disconnect";

import {AppServer, PlayerSocket} from "./types/socketTypes";

const httpserver = createServer();
const PORT = Number(process.env.PORT) || 3010;

const io: AppServer = new Server(httpserver, {
  cors: {
    origin: "*",
  },
});

const onlineUsers: Map<string, {userID: number, socketID: string}> = new Map();


io.use(authMiddleware);

io.on("connection", (socket: PlayerSocket) => {

  console.log(`Player connected ${socket.id} username: ${socket.data.user?.username}`);
  const username = socket.data.user.username;
  const userID = socket.data.user.id;

  onlineUsers.set(username, {userID, socketID: socket.id});
  io.emit("online-users", {users: Array.from(onlineUsers.keys())});

  registerMatchmakingHandlers(io, socket, onlineUsers);
  registerGameplayHandlers(io, socket);
  registerDisconnectHandlers(io, socket,onlineUsers);
});


httpserver.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.IO server running on http://0.0.0.0:${PORT}`);
});