import { getGame, getPlayingIn } from "../game/store";
import { AppServer, PlayerSocket } from "../types/socketTypes";

export function registerSpectatingHandlers(io: AppServer, socket: PlayerSocket) {
    const username = socket.data.user.username;

    socket.on('spectate-game', ({gameID}) => {
        const game = getGame(gameID);
        if(!game) {
            socket.emit('spectate-error', ({message: 'Game Not Found. Either it does not exists or has been completed already.'}));
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
        }
        socket.join(gameID);
        socket.emit('spectate-start', payload);
    });

    socket.on('spectate-player', ({username: targetUsername}) => {
        const gameID = getPlayingIn(targetUsername);

        if(!gameID) {
            socket.emit('spectate-error', {message: `${targetUsername} is not currently playing`});
            return;
        }

        const game = getGame(gameID);
        if(!game) {
            socket.emit('spectate-error', ({message: 'Game Not Found. Either it does not exists or has been completed already.'}));
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
        }
        socket.join(gameID);
        socket.emit('spectate-start', payload);
    })
}