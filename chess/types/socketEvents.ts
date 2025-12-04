import { Move } from "chess.js"

type Color = 'white' | 'black' | 'random';

export type ClientToServerEvents = {
    'challenge-user' : (payload: {toUsername: string, color: string}) => void,
    'accept-challenge' : {fromUsername: string, color: string}, // to be changed
    'reject-challenge' : {fromUsername: string}, // to be changed
    'join-room' : {roomID: string}, // to be changed
    'make-move' : {roomID: string, move: Move} // to be changed
    'get-online-users' : () => void,
}

export type ServerToClientEvents = {
    'online-users': (payload: {users: string[]}) => void,
    'incoming-challenge': (payload : {fromUsername: string, color: Color}) => void,
    'challenge-accepted': (payload: {roomID: string, byUsername: string, color: Color}) => void,
    'challenge-rejected': (payload: {by: string}) => void,
    'player-color' : (payload: {color: 'white' | 'black'}) => void,
    'opponent-move' : (payload: {move: Move}) => void,
    'move-history' : (payload: {moves: Move[]}) => void,
    'room-state' : (payload: {whiteConnected: boolean, blackConnected: boolean}) => void,
    'opponent-left' : () => void,
}