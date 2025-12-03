"use client";

import { useAuth } from "@/hooks/useAuth";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socketEvents";
import { createContext, ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface SocketContextType {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null,
    isConnected: boolean,
}

export const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({children} : {children: ReactNode}) {
    const { token } = useAuth();
    const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
    const [isConnected, setisConnected] = useState(false);

    useEffect(() => {
        if(!token) {
            socket?.disconnect();
            setSocket(null);
            setisConnected(false);
            return;
        }

        const newSocket = io('ws://localhost:3010', {
            auth: {token},
            transports: ['websocket'],
            autoConnect: true,
        });
        newSocket.on('connect', () => setisConnected(true));
        newSocket.on('disconnect', () => setisConnected(false));
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };

    }, [token]);

    return (
        <SocketContext.Provider value={{socket, isConnected}}>
            {children}
        </SocketContext.Provider>
    )
}