import {getSocket} from "@/lib/socket"
import { Move } from "chess.js";

const socket = getSocket();

export function joinRoom(roomId: string) {
    socket.emit("join-room", roomId);
}

export function sendMove(roomID: string, move: Move, color: "white" | "black") {
    socket.emit("make-move", {roomID, move, color});
}

export function addOnPlayerColor(callBack: (color: "white" | "black") => void) {
    socket.on("player-color", callBack);
}

export function addOnOpponentJoined(callback: () => void) {
    socket.on("opponent-joined", callback);
}

export function addOnOpponentLeft(callback: () => void) {
    socket.on("opponent-left", callback);
}

export function addOnOpponentMove(callback: (move: Move) => void) {
  socket.on("opponent-move", callback);
}

export function cleanupSocketListeners() {
  socket.off("player-color");
  socket.off("opponent-joined");
  socket.off("opponent-move");
  socket.off("opponent-left");
}