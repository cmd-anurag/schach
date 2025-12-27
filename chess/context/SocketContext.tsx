"use client";

import { useAuth } from "@/hooks/useAuth";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socketEvents";
import { createContext, ReactNode, useEffect, useState, useMemo } from "react";
import { io, Socket } from "socket.io-client";

export interface SocketContextType {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
    isConnected: boolean,
}

export const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({children} : {children: ReactNode}) {
    const { token } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

    // 1. Create the socket instance using useMemo.
    // We use autoConnect: false to prevent side effects (connection) during the render phase.
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = useMemo(() => {
        if (!token) return null;

        return io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: false, 
        });
    }, [token]);

    // 2. Manage the connection lifecycle in useEffect
    useEffect(() => {
        if (!socket) return;

        // Define listeners
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // Connect manually now that we are in the effect
        socket.connect();

        return () => {
            // Cleanup listeners and disconnect
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.disconnect();
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={{socket, isConnected}}>
            {children}
        </SocketContext.Provider>
    )
}