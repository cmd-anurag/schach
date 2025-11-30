export function registerDisconnectHandlers(io, socket, rooms, onlineUsers) {
  const username = socket.data.user.username;

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id} (${username})`);
    onlineUsers.delete(username);
    io.emit("online-users", Array.from(onlineUsers.keys()));

    //Room Deletion Logic to be implemented
    
    
  });
}
