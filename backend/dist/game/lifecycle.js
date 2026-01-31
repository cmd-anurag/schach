"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGame = startGame;
exports.endGame = endGame;
const utils_1 = require("../utils/utils");
const store_1 = require("./store");
const winnerMap = {
    white: 'WHITE',
    black: 'BLACK',
    draw: 'DRAW',
};
function startGame(io, socket, gameID, game, username) {
    let playerColor = null;
    if (game.white.username === username) {
        playerColor = 'white';
        game.white.socketID = socket.id;
    }
    else if (game.black.username === username) {
        playerColor = 'black';
        game.black.socketID = socket.id;
    }
    if (!playerColor) {
        socket.emit('join-error', { message: 'You are not in this game' });
        return;
    }
    socket.join(gameID);
    (0, utils_1.updateClock)(game);
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
        (0, utils_1.setTimeoutForCurrentPlayer)(io, socket, game, gameID);
        io.to(opponentSocketId).emit('opponent-connected');
    }
    console.log(`${username} (${playerColor}) joined game ${gameID}`);
}
function endGame(io, socket, game, gameID, result) {
    if (game.gameFinished)
        return;
    (0, utils_1.clearPlayerTimeout)(game);
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
    (0, store_1.deleteGame)(gameID);
    (0, store_1.removeFromPlaying)(game.white.username);
    (0, store_1.removeFromPlaying)(game.black.username);
}
async function saveGameToDB(payload, retries = 3, delay = 1000) {
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
    };
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(`${baseURL}/api/savegame`, {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });
            if (res.ok) {
                console.log(`✓ Game ${payload.gameID} saved successfully`);
                return;
            }
            else {
                const result = await res.json();
                const errorMessage = typeof result === 'object' && result !== null && 'message' in result ? result.message : 'Unknown error';
                throw new Error(`Server error: ${errorMessage}`);
            }
        }
        catch (err) {
            console.error(`✗ Save attempt ${attempt}/${retries} failed for game ${payload.gameID}:`, err);
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            else {
                console.error(`✗ Failed to save game ${payload.gameID} after ${retries} attempts`);
            }
        }
    }
}
//# sourceMappingURL=lifecycle.js.map