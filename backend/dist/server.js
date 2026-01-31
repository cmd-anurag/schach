"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const auth_1 = require("./socket/auth");
const matchmaking_1 = require("./socket/matchmaking");
const gameplay_1 = require("./socket/gameplay");
const disconnect_1 = require("./socket/disconnect");
const spectators_1 = require("./socket/spectators");
const httpserver = (0, http_1.createServer)();
const PORT = Number(process.env.PORT) || 3010;
const io = new socket_io_1.Server(httpserver, {
    cors: {
        origin: "*",
    },
});
const onlineUsers = new Map();
io.use(auth_1.authMiddleware);
io.on("connection", (socket) => {
    console.log(`Player connected ${socket.id} username: ${socket.data.user?.username}`);
    const username = socket.data.user.username;
    const userID = socket.data.user.id;
    onlineUsers.set(username, { userID, socketID: socket.id });
    io.emit("online-users", { users: Array.from(onlineUsers.keys()) });
    (0, matchmaking_1.registerMatchmakingHandlers)(io, socket, onlineUsers);
    (0, gameplay_1.registerGameplayHandlers)(io, socket);
    (0, spectators_1.registerSpectatingHandlers)(io, socket);
    (0, disconnect_1.registerDisconnectHandlers)(io, socket, onlineUsers);
});
httpserver.listen(PORT, "0.0.0.0", () => {
    console.log(`Socket.IO server running on http://0.0.0.0:${PORT}`);
});
//# sourceMappingURL=server.js.map