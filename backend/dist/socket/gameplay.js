"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGameplayHandlers = registerGameplayHandlers;
const lifecycle_1 = require("../game/lifecycle");
const store_1 = require("../game/store");
const utils_1 = require("../utils/utils");
function registerGameplayHandlers(io, socket) {
    const username = socket.data.user.username;
    // handler for client trying to join a game 
    socket.on("join-game", ({ gameID }) => {
        const game = (0, store_1.getGame)(gameID);
        if (!game) {
            socket.emit("join-error", { message: "Game not found" });
            return;
        }
        (0, lifecycle_1.startGame)(io, socket, gameID, game, username);
    });
    socket.on("make-move", ({ gameID, move }) => {
        const game = (0, store_1.getGame)(gameID);
        if (!game) {
            socket.emit("join-error", { message: "Game not found" });
            return;
        }
        if (game.gameFinished)
            return;
        const playerColor = (0, utils_1.extractPlayerColor)(game, username);
        if (!playerColor) {
            socket.emit("move-error", { message: "Not a participant" });
            return;
        }
        if (game.turn !== playerColor) {
            socket.emit("move-error", { message: "Not your turn" });
            return;
        }
        try {
            (0, utils_1.clearPlayerTimeout)(game);
            (0, utils_1.updateClock)(game);
            if (game.time.white === 0) {
                (0, lifecycle_1.endGame)(io, socket, game, gameID, { winner: 'black', reason: 'White Timed Out!' });
                return;
            }
            else if (game.time.black === 0) {
                (0, lifecycle_1.endGame)(io, socket, game, gameID, { winner: 'white', reason: 'Black Timed Out!' });
                return;
            }
            // increment
            if (game.turn === 'white') {
                game.time.white += game.time.increment;
            }
            else {
                game.time.black += game.time.increment;
            }
            const resultMove = game.chessInstance.move(move);
            const nextTurn = game.turn === 'white' ? "black" : 'white';
            game.turn = nextTurn;
            game.time.turnStartedAt = Date.now();
            io.to(gameID).emit('move-made', {
                move: resultMove,
                moveID: move.clientMoveID,
                turn: nextTurn,
                byColor: playerColor,
                timeLeft: {
                    white: game.time.white,
                    black: game.time.black,
                    turnStartedAt: game.time.turnStartedAt ?? Date.now(),
                }
            });
            // game over by checkmate 
            if (game.chessInstance.isCheckmate()) {
                (0, lifecycle_1.endGame)(io, socket, game, gameID, {
                    winner: game.turn === 'black' ? 'white' : 'black',
                    reason: 'Checkmate!',
                });
                return;
            }
            // game draw
            if (game.chessInstance.isDraw()) {
                (0, lifecycle_1.endGame)(io, socket, game, gameID, { winner: 'draw', reason: 'draw', });
                return;
            }
            (0, utils_1.setTimeoutForCurrentPlayer)(io, socket, game, gameID);
            // console.log(`Move in ${gameID} by ${username} (${playerColor}) — turn -> ${game.turn}`);
        }
        catch (err) {
            socket.emit("move-error", { message: `Invalid move from catch ${err}` });
        }
    });
    socket.on('resign-game', ({ gameID }) => {
        const game = (0, store_1.getGame)(gameID);
        if (!game)
            return;
        if (game.gameFinished)
            return;
        const playersInfo = (0, utils_1.identifyEmitter)(game, username);
        if (!playersInfo)
            return;
        (0, utils_1.updateClock)(game);
        (0, lifecycle_1.endGame)(io, socket, game, gameID, { winner: playersInfo.opponent.color, reason: `${playersInfo.player.color} resigned the game!`, });
        console.log(playersInfo.player.username + ' resigned the game.');
    });
    socket.on('offer-draw', ({ gameID }) => {
        const game = (0, store_1.getGame)(gameID);
        if (!game || game.gameFinished)
            return;
        const playersInfo = (0, utils_1.identifyEmitter)(game, username);
        if (!playersInfo)
            return;
        const targetSocketId = playersInfo.opponent.socketID;
        if (!targetSocketId)
            return;
        game.drawOffer = playersInfo.player.color;
        io.to(targetSocketId).emit('incoming-draw-offer');
        console.log(playersInfo.player.username + ' offered a draw to ' + playersInfo.opponent.username);
    });
    socket.on('accept-draw', ({ gameID }) => {
        const game = (0, store_1.getGame)(gameID);
        if (!game || game.gameFinished)
            return;
        const playersInfo = (0, utils_1.identifyEmitter)(game, username);
        if (!playersInfo)
            return;
        (0, utils_1.updateClock)(game);
        if (game.drawOffer === playersInfo.opponent.color) {
            game.drawOffer = null;
            (0, lifecycle_1.endGame)(io, socket, game, gameID, { winner: 'draw', reason: 'draw', });
            console.log(`${playersInfo.player.username} accepted draw offer from ${playersInfo.opponent.username}`);
        }
    });
    socket.on('reject-draw', ({ gameID }) => {
        const game = (0, store_1.getGame)(gameID);
        if (!game || game.gameFinished)
            return;
        const playersInfo = (0, utils_1.identifyEmitter)(game, username);
        if (!playersInfo)
            return;
        const targetSocketId = playersInfo.opponent.socketID;
        if (game.drawOffer === playersInfo.opponent.color) {
            game.drawOffer = null;
            if (targetSocketId) {
                io.to(targetSocketId).emit('draw-declined');
            }
            console.log(`${playersInfo.player.username} rejected a draw offer from ${playersInfo.opponent.username}`);
        }
    });
}
//# sourceMappingURL=gameplay.js.map