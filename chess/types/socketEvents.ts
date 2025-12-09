import { Move } from "chess.js"

type Color = 'white' | 'black' | 'random';

export type ClientToServerEvents = {
    'challenge-user' : (payload: {toUsername: string, color: string}) => void,
    'accept-challenge' : (payload: {fromUsername: string, color: string}) => void,
    'reject-challenge' : (payload: {fromUsername: string}) => void,
    'join-room' : (payload: {roomID: string}) => void,
    'make-move' : (payload: {roomID: string, move: Move}) => void,
    'get-online-users' : () => void,
}

export type ServerToClientEvents = {
    'online-users': (payload: {users: string[]}) => void,
    'incoming-challenge': (payload : {fromUsername: string, color: Color}) => void,
    'challenge-accepted': (payload: {roomID: string, color: 'white' | 'black', opponent: string}) => void,
    'challenge-rejected': (payload: {by: string}) => void,

    'game-start' : (payload: {
        roomID: string,
        myColor: 'white' | 'black',
        opponent: string,
        turn: 'white' | 'black',
        moveHistory: Move[],
        opponentConnected: boolean,
    }) => void,

    'move-made' : (payload: {
        move: Move,
        turn: 'white' | 'black',
        byColor: 'white' | 'black',
    }) => void,

    'opponent-connected' : () => void,
    'opponent-disconnected' : () => void,

    'game-over' : (payload: {
        winner: 'white' | 'black' | 'draw',
        reason: 'checkmate' | 'resignation' | 'timeout' | 'draw' | 'stalemate',
    }) => void,

    'room-error' : (payload: {message: string}) => void,
    'move-error' : (payload: {message: string}) => void,
}