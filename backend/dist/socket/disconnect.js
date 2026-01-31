"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDisconnectHandlers = registerDisconnectHandlers;
function registerDisconnectHandlers(io, socket, onlineUsers) {
    const username = socket.data.user.username;
    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id} (${username})`);
        onlineUsers.delete(username);
        io.emit("online-users", { users: Array.from(onlineUsers.keys()) });
    });
}
//# sourceMappingURL=disconnect.js.map