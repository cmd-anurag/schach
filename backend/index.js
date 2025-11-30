import { Server } from "socket.io";
import {createServer} from 'http';
import {authMiddleware} from "./socket/auth.js";
import {registerMatchmakingHandlers} from "./socket/matchmaking.js";
import {registerGameplayHandlers} from "./socket/gameplay.js";
import {registerDisconnectHandlers} from "./socket/disconnect.js";


const httpserver = createServer();
const PORT = process.env.PORT || 3010;

const io = new Server(httpserver, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map();
const onlineUsers = new Map();

io.use(authMiddleware);

io.on("connection", (socket) => {
  console.log(`Player connected ${socket.id} username: ${socket.data.user?.username}`);
  const username = socket.data.user.username;
  onlineUsers.set(username, socket.id);
  io.emit("online-users", {users: Array.from(onlineUsers.keys())});
  registerMatchmakingHandlers(io, socket, onlineUsers, rooms);
  registerGameplayHandlers(io, socket, rooms);
  registerDisconnectHandlers(io, socket, rooms, onlineUsers);
});

httpserver.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.IO server running on http://0.0.0.0:${PORT}`);
});