import { endGame, startGame } from "../game/lifecycle";
import { Game } from "../types/Game";
import { AppServer, PlayerSocket } from "../types/socketTypes";
import { updateClock, identifyEmitter, extractPlayerColor } from "../utils/utils";


export function registerGameplayHandlers(io: AppServer, socket: PlayerSocket, liveGames: Map<string, Game>) {
  const username = socket.data.user.username;

  // handler for client trying to join a game 
  socket.on("join-game", ({ gameID }) => {
    const game = liveGames.get(gameID);

    if (!game) {
      socket.emit("join-error", { message: "Game not found" });
      return;
    }

    startGame(io, socket, gameID, game, username);

  });

  socket.on("make-move", ({ gameID, move }) => {
    const game = liveGames.get(gameID);

    if (!game) {
      socket.emit("join-error", { message: "Game not found" });
      return;
    }
    if (game.gameFinished) return;

    const playerColor = extractPlayerColor(game, username);

    if (!playerColor) {
      socket.emit("move-error", { message: "Not a participant" });
      return;
    }

    if (game.turn !== playerColor) {
      socket.emit("move-error", { message: "Not your turn" });
      return;
    }

    try {
      updateClock(game);

      if (game.time.white === 0) {
        endGame(io, game, gameID, {winner: 'black', reason: 'White Timed Out!'});
        return;
      } else if (game.time.black === 0) {
        endGame(io, game, gameID, {winner: 'white', reason: 'Black Timed Out!'});
        return;
      }

      // increment
      if (game.turn === 'white') {
        game.time.white += game.time.increment;
      } else {
        game.time.black += game.time.increment;
      }

      game.chessInstance.move(move);
      const nextTurn = game.turn === 'white' ? "black" : 'white';
      game.turn = nextTurn;
      game.time.turnStartedAt = Date.now();

      io.to(gameID).emit('move-made', {
        move,
        turn: nextTurn,
        byColor: playerColor,
        timeLeft: {
          white: game.time.white,
          black: game.time.black,
          turnStartedAt: game.time.turnStartedAt ?? Date.now(),
        }
      })

      // game over by checkmate 
      if (game.chessInstance.isCheckmate()) {
        endGame(io, game, gameID, {
          winner: game.turn === 'black' ? 'white' : 'black',
          reason: 'Checkmate!',
        })
        return;
      }

      // game draw
      if (game.chessInstance.isDraw()) {
        endGame(io, game, gameID, {winner: 'draw', reason: 'draw',});
        return;
      }
      console.log(`Move in ${gameID} by ${username} (${playerColor}) — turn -> ${game.turn}`);

    } catch {
      socket.emit("move-error", { message: "Invalid move" });
    }
  });

  socket.on('game-timeout', ({ gameID }) => {

    const game = liveGames.get(gameID);
    if (!game || game.gameFinished) return;

    if (!extractPlayerColor(game, username)) return;

    updateClock(game);

    if (game.time.white === 0) {
      endGame(io, game, gameID, {winner: 'black', reason: 'White Timed Out!',});
    } else if (game.time.black === 0) {
      endGame(io, game, gameID, {winner: 'white', reason: 'Black Timed Out',});
    }

  });

  socket.on('resign-game', ({ gameID }) => {
    const game = liveGames.get(gameID);
    if (!game) return;
    if (game.gameFinished) return;

    const playersInfo = identifyEmitter(game, username);
    if (!playersInfo) return;

    updateClock(game);
    endGame(io, game, gameID, {winner: playersInfo.opponent.color, reason: `${playersInfo.player.color} resigned the game!`,});

    console.log(playersInfo.player.username + ' resigned the game.');
  });

  socket.on('offer-draw', ({ gameID }) => {
    const game = liveGames.get(gameID);
    if (!game || game.gameFinished) return;
    const playersInfo = identifyEmitter(game, username);
    if (!playersInfo) return;

    const targetSocketId = playersInfo.opponent.socketID;
    if (!targetSocketId) return;
    game.drawOffer = playersInfo.player.color;

    io.to(targetSocketId).emit('incoming-draw-offer');
    console.log(playersInfo.player.username + ' offered a draw to ' + playersInfo.opponent.username);
  });

  socket.on('accept-draw', ({ gameID }) => {
    const game = liveGames.get(gameID);
    if (!game || game.gameFinished) return;
    const playersInfo = identifyEmitter(game, username);
    if (!playersInfo) return;

    updateClock(game);

    if (game.drawOffer === playersInfo.opponent.color) {
      game.drawOffer = null;
      endGame(io, game, gameID, {winner: 'draw', reason: 'draw',});
    }

    console.log(`${playersInfo.player.username} accepted draw offer from ${playersInfo.opponent.username}`);
  });

  socket.on('reject-draw', ({ gameID }) => {
    const game = liveGames.get(gameID);
    if (!game || game.gameFinished) return;
    const playersInfo = identifyEmitter(game, username);
    if (!playersInfo) return;
    const targetSocketId = playersInfo.opponent.socketID;

    if (game.drawOffer === playersInfo.opponent.color) {
      game.drawOffer = null;
      if (targetSocketId) {
        io.to(targetSocketId).emit('draw-declined');
      }
      console.log(`${playersInfo.player.username} rejected a draw offer from ${playersInfo.opponent.username}`);
    }
  })


}
