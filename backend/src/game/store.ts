import { Game } from "../types/Game";

const liveGames: Map<string, Game> = new Map();

export function addGame(gameID: string, game: Game) {
    liveGames.set(gameID, game);
}

export function deleteGame(gameID: string) {
    liveGames.delete(gameID)
}

export function getGame(gameID: string) {
    return liveGames.get(gameID);
}