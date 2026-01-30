import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PlayerSocket } from "../types/socketTypes";

dotenv.config();

export function authMiddleware(
  socket: PlayerSocket,
  next: (err?: Error) => void
) {
  const token = socket.handshake.auth?.token;

  if (!token || typeof token !== "string") {
    return next(new Error("not authenticated"));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error("Server misconfigured: JWT_SECRET missing"));
  }

  try {
    
    const payload = jwt.verify(token, secret) as {
      id: number;
      username: string;
    };

    socket.data.user = {
      id: payload.id,
      username: payload.username,
    };

    next();
  } catch(err) {
    return next(new Error(`invalid token ${err}`));
  }
}
