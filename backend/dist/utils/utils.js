"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClock = updateClock;
exports.identifyEmitter = identifyEmitter;
exports.extractPlayerColor = extractPlayerColor;
exports.setTimeoutForCurrentPlayer = setTimeoutForCurrentPlayer;
exports.clearPlayerTimeout = clearPlayerTimeout;
const lifecycle_1 = require("../game/lifecycle");
// this function simply updates the clock based only on ELAPSED time since the last turn started at
function updateClock(game) {
    if (!game.time.running || game.time.turnStartedAt === null)
        return;
    const now = Date.now();
    const elapsed = now - game.time.turnStartedAt;
    if (game.turn === 'white') {
        game.time.white = Math.max(0, game.time.white - elapsed);
    }
    else {
        game.time.black = Math.max(0, game.time.black - elapsed);
    }
    game.time.turnStartedAt = now;
}
function identifyEmitter(game, username) {
    if (game.white.username === username) {
        return {
            player: {
                color: 'white',
                username,
                socketID: game.white.socketID,
            },
            opponent: {
                color: 'black',
                username: game.black.username,
                socketID: game.black.socketID,
            }
        };
    }
    else if (game.black.username === username) {
        return {
            player: {
                color: 'black',
                username,
                socketID: game.black.socketID,
            },
            opponent: {
                color: 'white',
                username: game.white.username,
                socketID: game.white.socketID,
            }
        };
    }
    return null;
}
function extractPlayerColor(game, username) {
    if (game.white.username === username)
        return 'white';
    if (game.black.username === username)
        return 'black';
    return null;
}
function setTimeoutForCurrentPlayer(io, socket, game, gameID) {
    const timeLeft = game.turn === 'white' ? game.time.white : game.time.black;
    game.time.timeoutHandle = setTimeout(() => {
        if (game.gameFinished)
            return;
        updateClock(game);
        if (game.time.white <= 0) {
            (0, lifecycle_1.endGame)(io, socket, game, gameID, { winner: 'black', reason: 'White Timed out!' });
        }
        else if (game.time.black <= 0) {
            (0, lifecycle_1.endGame)(io, socket, game, gameID, { winner: 'white', reason: 'Black Timed out!' });
        }
    }, timeLeft + 100);
}
function clearPlayerTimeout(game) {
    if (game.time.timeoutHandle) {
        clearTimeout(game.time.timeoutHandle);
        game.time.timeoutHandle = null;
    }
}
//# sourceMappingURL=utils.js.map