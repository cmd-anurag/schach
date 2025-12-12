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
    time: {
        white: number,
        black: number,
        increment: number,
        lastTick: number | null,
        running: boolean,
    }
}