import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io("wss://schach.onrender.com", {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });
  }

  return socket;
}
