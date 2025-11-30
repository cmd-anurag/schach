import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socketEvents";
import { getToken } from "./auth";
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let lastToken: string | null = null

function getTokenFromStorage() {
    if(typeof window === 'undefined') return null;

    return getToken();
}

export function getSocket() {
    const token = getTokenFromStorage();

    // no token in storage
    if(!token) {
        if(socket) {
            socket.disconnect();
            socket = null;
            lastToken = null;
        }
        return null;
    }

    // token exists and matches the last used socket
    if(socket && lastToken === token) {
        return socket;
    }

    // socket exists but does not match
    if(socket) {
        socket.disconnect();
        socket = null;
    }

    // create new socket
    socket = io('ws://localhost:3010', {
        auth: {token},
        transports: ['websocket'],
        autoConnect: true,
    })

    return socket;
}