import jwt, { JwtPayload } from "jsonwebtoken";
import cookie from "cookie";
import dotenv from "dotenv";
import { PlayerSocket } from "../types/socketTypes";

dotenv.config();

export function authMiddleware(
  socket: PlayerSocket,
  next: (err?: Error) => void
) {
  const rawCookie = socket.request.headers.cookie;

  if (!rawCookie) {
    return next(new Error("not authenticated"));
  }

  const cookies = cookie.parse(rawCookie);
  const token = cookies.session;

  if (!token) {
    return next(new Error("not authenticated"));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error("Server misconfigured: JWT_SECRET missing"));
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload & {
      id: number;
      username: string;
    };

    socket.data.user = {
      id: payload.id,
      username: payload.username,
    };

    next();
  } catch (err) {
    return next(new Error("invalid token"));
  }
}
