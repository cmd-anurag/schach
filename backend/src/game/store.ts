import { Game } from "../types/Game";

const liveGames: Map<string, Game> = new Map();
const playing: Map<string, string> = new Map(); // username --> roomID

export function addGame(gameID: string, game: Game) {
    liveGames.set(gameID, game);
}

export function deleteGame(gameID: string) {
    liveGames.delete(gameID)
}

export function getGame(gameID: string) {
    return liveGames.get(gameID);
}

export function addToPlaying(username:string, gameID:string) {
    playing.set(username, gameID);
}

export function removeFromPlaying(username:string) {
    playing.delete(username);
}

export function getPlayingIn(username: string) {
    return playing.get(username);
}