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
    chessInstance: Chess,
    gameFinished: boolean,
    time: {
        white: number,
        black: number,
        increment: number,
        turnStartedAt: number | null, // At turnStartedAt, the active player had exactly X ms left.
        running: boolean,
    }
}