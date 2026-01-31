import { Game } from "../types/Game";
import { AppServer, PlayerSocket } from "../types/socketTypes";
import { clearPlayerTimeout, setTimeoutForCurrentPlayer, updateClock } from "../utils/utils";
import { deleteGame, removeFromPlaying } from "./store";

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
            serverNow: Date.now(),
        }
    });

    const opponentSocketId = playerColor === 'white' ? game.black.socketID : game.white.socketID;
    if (opponentSocketId) {
      game.time.turnStartedAt = Date.now();
      game.time.running = true;
      setTimeoutForCurrentPlayer(io, socket, game, gameID);
      io.to(opponentSocketId).emit('opponent-connected');
    }

    console.log(`${username} (${playerColor}) joined game ${gameID}`);
}

export function endGame(io: AppServer, socket: PlayerSocket, game: Game, gameID: string, result: EndGameResult) {

    if (game.gameFinished) return;
    clearPlayerTimeout(game);
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
    removeFromPlaying(game.white.username);
    removeFromPlaying(game.black.username);
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

async function saveGameToDB(payload: SaveGamePayload, retries = 3, delay = 1000) {
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

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(`${baseURL}/api/savegame`, {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });
            
            if (res.ok) {
                console.log(`✓ Game ${payload.gameID} saved successfully`);
                return;
            } else {
                const result : unknown = await res.json();
                const errorMessage = typeof result === 'object' && result !== null && 'message' in result ? result.message : 'Unknown error';
                throw new Error(`Server error: ${errorMessage}`);
            }
        } catch (err) {
            console.error(`✗ Save attempt ${attempt}/${retries} failed for game ${payload.gameID}:`, err);
            
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error(`✗ Failed to save game ${payload.gameID} after ${retries} attempts`);
            }
        }
    }
}