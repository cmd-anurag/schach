import { Game } from "../types/Game";
import { AppServer, PlayerSocket } from "../types/socketTypes";
import { updateClock } from "../utils/utils";
import { deleteGame } from "./store";

type EndGameResult = {
    winner: 'white' | 'black' | 'draw',
    reason: string,
}
const winnerMap = {
    white: 'WHITE',
    black: 'BLACK',
    draw: 'DRAW',
} as const;

export function startGame(io: AppServer, socket: PlayerSocket, gameID: string, game: Game, username: string) {

    let playerColor: 'white' | 'black' | null = null;
    if (game.white.username === username) {
        playerColor = 'white';
        game.white.socketID = socket.id;
    } else if (game.black.username === username) {
        playerColor = 'black';
        game.black.socketID = socket.id;
    }

    if (!playerColor) {
        socket.emit('join-error', { message: 'You are not in this game' });
        return;
    }

    socket.join(gameID);
    updateClock(game);
    game.time.turnStartedAt = Date.now();

    socket.emit('game-start', {
        gameID,
        myColor: playerColor,
        opponent: playerColor === 'white' ? game.black.username : game.white.username,
        turn: game.turn,
        moveHistory: game.chessInstance.history(),
        opponentConnected: playerColor === 'white' ? !!game.black.socketID : !!game.white.socketID,
        timeLeft: {
            white: game.time.white,
            black: game.time.black,
            turnStartedAt: game.time.turnStartedAt,
        }
    });

    const opponentSocketId = playerColor === 'white' ? game.black.socketID : game.white.socketID;
    if (opponentSocketId) {
      game.time.turnStartedAt = Date.now();
      game.time.running = true;
      io.to(opponentSocketId).emit('opponent-connected');
    }

    console.log(`${username} (${playerColor}) joined game ${gameID}`);
}

export function endGame(io: AppServer, socket: PlayerSocket, game: Game, gameID: string, result: EndGameResult) {

    if (game.gameFinished) return;

    game.gameFinished = true;
    game.time.running = false;
    game.time.turnStartedAt = null,

    io.to(gameID).emit('game-over', result);

    saveGameToDB({
        gameID: game.id,
        whiteID: game.white.userID,
        blackID: game.black.userID,
        result: winnerMap[result.winner],
        reason: result.reason,
        moves: game.chessInstance.history(),
        finalFEN: game.chessInstance.fen(),
        time: {
            white: game.time.white,
            black: game.time.black,
            increment: game.time.increment,
        },
        startedAt: game.gameStartedAt,
        endedAt: Date.now()
    });

    deleteGame(gameID);
}

type SaveGamePayload = {
    gameID: string,
    whiteID: number | null,
    blackID: number | null,
    result : 'WHITE' | 'BLACK' | 'DRAW',
    reason: string,
    moves: string[],
    finalFEN: string,
    time: {
        white: number,
        black: number,
        increment: number,
    }
    startedAt: number,
    endedAt: number,
}

async function saveGameToDB(payload : SaveGamePayload) {
    const baseURL = process.env.NEXT_BACKEND_URL;

    const requestBody = {
        gameID: payload.gameID,
        whiteID: payload.whiteID,
        blackID: payload.blackID,
        result: payload.result,
        reason: payload.reason,
        moves: payload.moves,
        finalFEN: payload.finalFEN,
        time: payload.time,
        startedAt: payload.startedAt,
        endedAt: payload.endedAt,
    }
    try {
        const res = await fetch(`${baseURL}/api/savegame`, {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
        
        const result: any = await res.json();
        if(res.ok) {
            console.log('Saved the game to database');
        } else {
            console.log(result.message);
        }
    } catch(err) {
        console.log(err);
    }
}