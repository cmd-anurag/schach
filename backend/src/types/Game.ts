import { Chess, Move } from "chess.js"

export type Game = {
    id: string,
    white: {
        userID: number | null,
        username: string,
        socketID: string | null,
    },
    black: {
        userID: number | null,
        username: string,
        socketID: string | null,
    },
    turn: "white" | "black",
    chessInstance: Chess,
    gameFinished: boolean,
    gameStartedAt: number,
    time: {
        white: number,
        black: number,
        baseTime: number,
        increment: number,
        turnStartedAt: number | null, // At turnStartedAt, the active player had exactly X ms left.
        running: boolean,
        timeoutHandle : NodeJS.Timeout | null;
    },
    drawOffer?: 'white' | 'black' | null, // whether a draw offer by this color is currently pending
    spectators: Set<string>
}