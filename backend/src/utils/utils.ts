import { Game } from "../types/Game";

type PlayersInfo = {
  player: {
    color: 'white' | 'black',
    username: string,
    socketID: string | null,
  },
  opponent: {
    color: 'white' | 'black',
    username: string,
    socketID: string | null,
  },
}

// this function simply updates the clock based only on ELAPSED time since the last turn started at
export function updateClock(game: Game) {
  if (!game.time.running || game.time.turnStartedAt === null) return;

  const now = Date.now();
  const elapsed = now - game.time.turnStartedAt;

  if (game.turn === 'white') {
    game.time.white = Math.max(0, game.time.white - elapsed);
  } else {
    game.time.black = Math.max(0, game.time.black - elapsed);
  }
  game.time.turnStartedAt = now;
}

export function identifyEmitter(game: Game, username: string): PlayersInfo | null {
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
    }
  } else if (game.black.username === username) {
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
    }
  }

  return null;
}

export function extractPlayerColor(game: Game, username: string) {
  if (game.white.username === username) return 'white';
  if (game.black.username === username) return 'black';
  return null;
}