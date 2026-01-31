"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function authMiddleware(socket, next) {
    const token = socket.handshake.auth?.token;
    if (!token || typeof token !== "string") {
        return next(new Error("not authenticated"));
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return next(new Error("Server misconfigured: JWT_SECRET missing"));
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        socket.data.user = {
            id: payload.id,
            username: payload.username,
        };
        next();
    }
    catch (err) {
        return next(new Error(`invalid token ${err}`));
    }
}
//# sourceMappingURL=auth.js.map