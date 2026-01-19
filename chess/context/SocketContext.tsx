"use client";
import { createContext, ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socketEvents";
import { useAuth } from "@/hooks/useAuth";

export interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | null>(null);

// Socket SINGLETON
let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

function getSocket() {
  if (!socketInstance) {
    socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  const socket = getSocket();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    
    if (loading) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

   
    if (isLoggedIn) {
      socket.connect();
    } else {
      socket.disconnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [isLoggedIn, loading, socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}