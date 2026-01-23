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
  const { isLoggedIn, loading, wsToken, refreshUser } = useAuth();

  // Socket stored in state (safe to expose)
  const [socket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(
    () => getSocketSingleton()
  );

  // Imperative handle (DO NOT touch during render)
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Manage socket lifecycle & auth
  useEffect(() => {
    const s = socketRef.current;
    if (!s || loading) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);


    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    if (isLoggedIn && wsToken) {
      s.auth = { token: wsToken }; // mutate REF only
      if (!s.connected) s.connect();
    } else {
      if (s.connected) s.disconnect();
    }

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, [isLoggedIn, wsToken, loading, refreshUser]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
