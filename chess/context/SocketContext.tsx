"use client";
import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socketEvents";
import { useAuth } from "@/hooks/useAuth";

export interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | null>(null);

// ---- module-level singleton ----
let socketSingleton: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

function getSocketSingleton() {
  if (!socketSingleton) {
    socketSingleton = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
      transports: ["websocket"],
      autoConnect: false,
    });
  }
  return socketSingleton;
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, token } = useAuth();

  const [socket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(
    () => getSocketSingleton()
  );

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Manage socket lifecycle & auth
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);


    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on('connect_error', (err) => console.log(err));

    if (isLoggedIn && token) {
      s.auth = { token };
      if (!s.connected) s.connect();
    } else {
      if (s.connected) s.disconnect();
    }

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off('connect_error');
    };
  }, [isLoggedIn, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
