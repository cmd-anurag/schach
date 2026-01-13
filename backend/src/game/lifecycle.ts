import { Game } from "../types/Game";
import { AppServer, PlayerSocket } from "../types/socketTypes";
import { updateClock } from "../utils/utils";
import { deleteGame } from "./store";

type EndGameResult = {
    winner: 'white' | 'black' | 'draw',
    reason: string,
}

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

export function endGame(io: AppServer, game: Game, gameID: string, result: EndGameResult) {

    if (game.gameFinished) return;

    game.gameFinished = true;
    game.time.running = false;
    game.time.turnStartedAt = null,

    io.to(gameID).emit('game-over', result);

    deleteGame(gameID);
    // TODO - POST GAME CLEANUP
}