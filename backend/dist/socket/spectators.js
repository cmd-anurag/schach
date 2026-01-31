"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSpectatingHandlers = registerSpectatingHandlers;
const store_1 = require("../game/store");
function registerSpectatingHandlers(io, socket) {
    const username = socket.data.user.username;
    socket.on('spectate-game', ({ gameID }) => {
        const game = (0, store_1.getGame)(gameID);
        if (!game) {
            socket.emit('spectate-error', ({ message: 'Game Not Found. Either it does not exists or has been completed already.' }));
            return;
        }
        game.spectators.add(username);
        const payload = {
            gameID,
            whiteUsername: game.white.username,
            blackUsername: game.black.username,
            turn: game.turn,
            moveHistory: game.chessInstance.history(),
            timeLeft: {
                white: game.time.white,
                black: game.time.black,
                turnStartedAt: game.time.turnStartedAt ?? Date.now()
            }
        };
        socket.join(gameID);
        socket.emit('spectate-start', payload);
    });
    socket.on('spectate-player', ({ username: targetUsername }) => {
        const gameID = (0, store_1.getPlayingIn)(targetUsername);
        if (!gameID) {
            socket.emit('spectate-error', { message: `${targetUsername} is not currently playing` });
            return;
        }
        const game = (0, store_1.getGame)(gameID);
        if (!game) {
            socket.emit('spectate-error', ({ message: 'Game Not Found. Either it does not exists or has been completed already.' }));
            return;
        }
        game.spectators.add(username);
        const payload = {
            gameID,
            whiteUsername: game.white.username,
            blackUsername: game.black.username,
            turn: game.turn,
            moveHistory: game.chessInstance.history(),
            timeLeft: {
                white: game.time.white,
                black: game.time.black,
                turnStartedAt: game.time.turnStartedAt ?? Date.now()
            }
        };
        socket.join(gameID);
        socket.emit('spectate-start', payload);
    });
}
//# sourceMappingURL=spectators.js.map