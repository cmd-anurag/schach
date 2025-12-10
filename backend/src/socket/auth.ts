import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv'
import { PlayerSocket } from '../types/socketTypes';

dotenv.config();
// a middleware which runs before "connection event" it verifies whether that connection is logged in

export function authMiddleware(socket: PlayerSocket, next: (err?: Error) => void) {
    const token = socket.handshake.auth?.token;

    if(!token) {
        return next(new Error('not authenticated'));
    }

    const secret = process.env.JWT_SECRET;
    if(!secret) {
        return next(new Error('Server Misconfigured, JWT SECRET IS MISSING!'));
    }

    try {
        const payload = jwt.verify(token, secret) as JwtPayload & {id: string, username: string};
        socket.data.user = {
            id: payload.id,
            username: payload.username
        };
        next();
    } catch(error: any) {
        console.log(error.message);
        return next(new Error("Invalid Token"));
    }
}