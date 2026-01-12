import { Server } from "socket.io";
import {createServer} from 'http';
import {authMiddleware} from "./socket/auth";
import {registerMatchmakingHandlers} from "./socket/matchmaking";
import {registerGameplayHandlers} from "./socket/gameplay";
import {registerDisconnectHandlers} from "./socket/disconnect";

import {AppServer, PlayerSocket} from "./types/socketTypes";
import {Game} from "./types/Game";

const httpserver = createServer();
const PORT = Number(process.env.PORT) || 3010;

const io: AppServer = new Server(httpserver, {
  cors: {
    origin: "*",
  },
});

const onlineUsers: Map<string, string> = new Map();
const liveGames: Map<string, Game> = new Map();

io.use(authMiddleware);

io.on("connection", (socket: PlayerSocket) => {

  console.log(`Player connected ${socket.id} username: ${socket.data.user?.username}`);
  const username = socket.data.user.username;
  onlineUsers.set(username, socket.id);
  io.emit("online-users", {users: Array.from(onlineUsers.keys())});

  registerMatchmakingHandlers(io, socket, onlineUsers, liveGames);
  registerGameplayHandlers(io, socket, liveGames);
  registerDisconnectHandlers(io, socket, liveGames, onlineUsers);
});

httpserver.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.IO server running on http://0.0.0.0:${PORT}`);
});