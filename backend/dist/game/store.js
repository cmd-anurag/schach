"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGame = addGame;
exports.deleteGame = deleteGame;
exports.getGame = getGame;
exports.addToPlaying = addToPlaying;
exports.removeFromPlaying = removeFromPlaying;
exports.getPlayingIn = getPlayingIn;
const liveGames = new Map();
const playing = new Map(); // username --> roomID
function addGame(gameID, game) {
    liveGames.set(gameID, game);
}
function deleteGame(gameID) {
    liveGames.delete(gameID);
}
function getGame(gameID) {
    return liveGames.get(gameID);
}
function addToPlaying(username, gameID) {
    playing.set(username, gameID);
}
function removeFromPlaying(username) {
    playing.delete(username);
}
function getPlayingIn(username) {
    return playing.get(username);
}
//# sourceMappingURL=store.js.map