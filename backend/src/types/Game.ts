import { Chess, Move } from "chess.js"

export type Room = {
    id: string,
    white: {
        username: string,
        socketID: string | null,
    },
    black: {
        username: string,
        socketID: string | null,
    },
    turn: "white" | "black",
    moveHistory: Move[],
    chessInstance: Chess,
}