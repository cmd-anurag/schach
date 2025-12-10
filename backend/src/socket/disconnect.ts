import { Room } from "../types/Game";
import { AppServer, PlayerSocket } from "../types/socketTypes";

export function registerDisconnectHandlers(io: AppServer, socket: PlayerSocket, rooms: Map<string, Room>, onlineUsers: Map<string, string>) {
  const username = socket.data.user.username;

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id} (${username})`);
    onlineUsers.delete(username);
    io.emit("online-users", { users: Array.from(onlineUsers.keys()) });

    // Room Deletion Logic to be implemented (when the game is over delete the room not on disconnectionn)
    
    
  });
}
