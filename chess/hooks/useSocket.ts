import { SocketContext, SocketContextType } from "@/context/SocketContext";
import { useContext } from "react";

export function useSocket(): SocketContextType {
    const context = useContext(SocketContext);
    if(!context) {
        throw new Error('bruh did you forget to wrap root with socket provider');
    }
    return context;
}