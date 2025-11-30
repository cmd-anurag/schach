import { Move } from "chess.js";
import { io, Socket } from "socket.io-client";


let socket: Socket | null = null;
let currentToken: string | null = null;

function createSocket(token: string) {
  return io(process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3010", {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });
}

export function initSocket(token: string) {
  // If token changed, fully recreate socket
  if (socket && currentToken === token) return socket;

  cleanupSocket(); // remove existing

  currentToken = token;
  socket = createSocket(token);

  socket.on("connect_error", (err) => {
    console.error("socket connect_error", err.message || err);
  });

  socket.on("connect", () => {
    console.log("socket connected", socket?.id);
  });

  return socket;
}

export function getSocket(): Socket {
  if (!socket) throw new Error("Socket not initialized. call initSocket(token) first.");
  return socket;
}

export function cleanupSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  try { socket.disconnect(); } catch (e) { }
  socket = null;
  currentToken = null;
}

/* --- Matchmaking API --- */
export function sendChallenge(toUsername: string, color: "white" | "black" | "random") {
  getSocket().emit("challenge-user", { toUsername, color });
}
export function acceptChallenge(fromUsername: string, color: "white" | "black" | "random") {
  getSocket().emit("accept-challenge", { fromUsername, color });
}
export function rejectChallenge(fromUsername: string) {
  getSocket().emit("reject-challenge", { fromUsername });
}

/* --- Gameplay API --- */
export function joinRoom(roomID: string) {
  getSocket().emit("join-room", roomID);
}
export function sendMove(roomID: string, move: Move) {
  getSocket().emit("make-move", { roomID, move });
}

/* --- Listener registration helpers (they just attach listeners) --- */
export function onIncomingChallenge(cb: (payload: any) => void) { getSocket().on("incoming-challenge", cb); }
export function onChallengeAccepted(cb: (payload: any) => void) { getSocket().on("challenge-accepted", cb); }
export function onChallengeRejected(cb: (p: any) => void) { getSocket().on("challenge-rejected", cb); }
export function onOnlineUsers(cb: (list: string[]) => void) { getSocket().on("online-users", cb); }

export function onPlayerColor(cb: (color: "white" | "black") => void) { getSocket().on("player-color", cb); }
export function onOpponentMove(cb: (move: any) => void) { getSocket().on("opponent-move", cb); }
export function onMoveHistory(cb: (payload: { moves: any[] }) => void) { getSocket().on("move-history", cb); }
export function onRoomState(cb: (state: any) => void) { getSocket().on("room-state", cb); }
export function onOpponentLeft(cb: (p: any) => void) { getSocket().on("opponent-left", cb); }
