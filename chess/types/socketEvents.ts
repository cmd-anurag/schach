import { Move } from "chess.js"

type Color = 'white' | 'black' | 'random';

export type ClientToServerEvents = {
    'challenge-user' : {toUsername: string, color: string},
    'accept-challenge' : {fromUsername: string, color: string},
    'reject-challenge' : {fromUsername: string},
    'join-room' : {roomID: string},
    'make-move' : {roomID: string, move: Move}
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