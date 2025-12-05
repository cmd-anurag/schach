"use client";

import { useAuth } from "@/hooks/useAuth";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socketEvents";
import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface SocketContextType {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
    isConnected: boolean,
}

export const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({children} : {children: ReactNode}) {
    const { token } = useAuth();
    // const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
    const socket = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if(!token) {
            socket.current?.disconnect();
            socket.current = null;
            setIsConnected(false);
            return;
        }

        const newSocket = io('ws://localhost:3010', {
            auth: {token},
            transports: ['websocket'],
            autoConnect: true,
        });
        newSocket.on('connect', () => setIsConnected(true));
        newSocket.on('disconnect', () => setIsConnected(false));
        socket.current = newSocket;

        return () => {
            newSocket.disconnect();
        };

    }, [token]);

    return (
        <SocketContext.Provider value={{socket: socket.current, isConnected}}>
            {children}
        </SocketContext.Provider>
    )
}