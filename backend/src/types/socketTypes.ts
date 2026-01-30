import { Move, PieceSymbol } from "chess.js"
import { Server, Socket } from "socket.io";
export type ChallengeColor = 'white' | 'black' | 'random';
export type MoveIntent = {
    from: string, 
    to: string,
    promotion?: PieceSymbol,
    clientMoveID: number,
}

export type ClientToServerEvents = {
    'challenge-user' : (payload: {toUsername: string, color: ChallengeColor, time: number, increment: number}) => void,
    'accept-challenge' : (payload: {fromUsername: string, color: ChallengeColor, time: number, increment: number}) => void,
    'reject-challenge' : (payload: {fromUsername: string}) => void,
    'join-game' : (payload: {gameID: string}) => void,
    'make-move' : (payload: {gameID: string, move: MoveIntent}) => void,
    'get-online-users' : () => void,
    'resign-game' : (payload: {gameID: string}) => void,
    'offer-draw' : (payload: {gameID: string}) => void,
    'accept-draw' : (payload: {gameID: string}) => void,
    'reject-draw' : (payload: {gameID: string}) => void,
    'spectate-game' : (payload: {gameID: string}) => void,
    'spectate-player' : (payload: {username: string}) => void;
}

export type ServerToClientEvents = {
    'online-users': (payload: {users: string[]}) => void,
    'incoming-challenge': (payload : {fromUsername: string, color: ChallengeColor, time: number, increment: number}) => void,
    'challenge-accepted': (payload: {gameID: string, color: 'white' | 'black', opponent: string}) => void,
    'challenge-rejected': (payload: {by: string}) => void,

    'spectate-start': (payload: {
        gameID: string,
        whiteUsername: string,
        blackUsername: string,
        turn: 'white' | 'black',
        moveHistory: string[],
        timeLeft:  {
            white: number,
            black: number,
            turnStartedAt: number,
        }
    }) => void,

    'game-start' : (payload: {
        gameID: string,
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
        moveID: number,
        turn: 'white' | 'black',
        byColor: 'white' | 'black',
        timeLeft: {
            white: number,
            black: number,
            turnStartedAt: number,
        },
    }) => void,

    'incoming-draw-offer' : () => void;
    'draw-declined' : () => void;

    'opponent-connected' : () => void,
    'opponent-disconnected' : () => void,

    'game-over' : (payload: {
        winner: 'white' | 'black' | 'draw',
        reason: string,
    }) => void,

    'join-error' : (payload: {message: string}) => void,
    'move-error' : (payload: {message: string}) => void,
    'challenge-error' : (payload: {message: string}) => void,
    'spectate-error' : (payload: {message: string}) => void,
}

export interface InterServerEvents {}


export interface SocketData {
    user: {
        id: number,
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