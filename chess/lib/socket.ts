import {io, Socket} from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() : Socket
{
    if(!socket) {
        const host = typeof window !== "undefined"
            ? window.location.hostname
            : "localhost";        
            socket = io(`ws://${host}:3010`, {autoConnect: true});
    }

    return socket;
}