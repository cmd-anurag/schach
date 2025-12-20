import { Move } from "chess.js"
import { Server, Socket } from "socket.io";
export type ChallengeColor = 'white' | 'black' | 'random';

export type ClientToServerEvents = {
    'challenge-user' : (payload: {toUsername: string, color: ChallengeColor, time: number, increment: number}) => void,
    'accept-challenge' : (payload: {fromUsername: string, color: ChallengeColor, time: number, increment: number}) => void,
    'reject-challenge' : (payload: {fromUsername: string}) => void,
    'join-room' : (payload: {roomID: string}) => void,
    'make-move' : (payload: {roomID: string, move: Move}) => void,
    'get-online-users' : () => void,
}

export type ServerToClientEvents = {
    'online-users': (payload: {users: string[]}) => void,
    'incoming-challenge': (payload : {fromUsername: string, color: ChallengeColor, time: number, increment: number}) => void,
    'challenge-accepted': (payload: {roomID: string, color: 'white' | 'black', opponent: string}) => void,
    'challenge-rejected': (payload: {by: string}) => void,

    'game-start' : (payload: {
        roomID: string,
        myColor: 'white' | 'black',
        opponent: string,
        turn: 'white' | 'black',
        moveHistory: string[],
        opponentConnected: boolean,
        timeLeft: {
            white: number,
            black: number,
            turnStartedAt: number,
        },
    }) => void,

    'move-made' : (payload: {
        move: Move,
        turn: 'white' | 'black',
        byColor: 'white' | 'black',
        timeLeft: {
            white: number,
            black: number,
            turnStartedAt: number,
        },
    }) => void,

    'opponent-connected' : () => void,
    'opponent-disconnected' : () => void,

    'game-over' : (payload: {
        winner: 'white' | 'black' | 'draw',
        reason: 'checkmate' | 'resignation' | 'timeout' | 'draw' | 'stalemate',
    }) => void,

    'room-error' : (payload: {message: string}) => void,
    'move-error' : (payload: {message: string}) => void,
    'challenge-error' : (payload: {message: string}) => void,
}

export interface InterServerEvents {}


export interface SocketData {
    user: {
        id: string,
        username: string;
    };
}

// the type of whole Server
export type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// A single player's socket connection
export type PlayerSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;