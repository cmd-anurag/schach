import jwt from 'jsonwebtoken';

// a middleware which runs before "connection event" it verifies whether that connection is logged in

export function authMiddleware(socket, next) {
    const token = socket.handshake.auth?.token;

    if(!token) {
        return next(new Error('not authenticated'));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.user = {
            id: payload.id,
            username: payload.username
        };
        next();
    } catch(error) {
        console.log(error.message);
        return next(new Error("Invalid Token"));
    }
}