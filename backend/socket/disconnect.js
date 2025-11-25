export function registerDisconnectHandlers(io, socket, rooms, onlineUsers) {
  const username = socket.data.user.username;

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id} (${username})`);
    onlineUsers.delete(username);
    io.emit("online-users", Array.from(onlineUsers.keys()));

    // Clean up any rooms where this socket was playing
    for (const [roomID, room] of rooms.entries()) {
      if (room.white === socket.id || room.black === socket.id) {
        io.to(roomID).emit("opponent-left");
        rooms.delete(roomID);
        console.log(`Room ${roomID} deleted because ${username} left`);
      }
    }
  });
}
