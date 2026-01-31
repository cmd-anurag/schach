import { useSocket } from "./useSocket";
import { useState, useEffect } from "react";
import { useChessClock } from "./useChessClock";
import { ServerToClientEvents } from "@/types/socketEvents";
import { toast } from "sonner";

export function useSpectate({username, gameID} : {username?: string, gameID?: string}) {
    const {socket} = useSocket();

    // STATES
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [cursor, setCursor] = useState(moveHistory.length);
    const [turn, setTurn] = useState<'white' | 'black'>('white');

    const { whiteTime, blackTime, sync, stop } = useChessClock();
    const [whiteUsername, setWhiteUsername] = useState<string | null>(null);
    const [blackUsername, setBlackUsername] = useState<string | null>(null);

    useEffect(() => {
        if(gameID) {
            socket?.emit('spectate-game', { gameID });
        } else if (username) {
            socket?.emit('spectate-player', { username });
        }
    }, [socket, gameID, username]);

    useEffect(() => {
        if (!socket) return;

        const handleSpecStart: ServerToClientEvents['spectate-start'] = (payload) => {
            setWhiteUsername(payload.whiteUsername);
            setBlackUsername(payload.blackUsername);
            setTurn(payload.turn);
            setMoveHistory(() => {
                setCursor(payload.moveHistory.length);
                return payload.moveHistory;
            });
            sync({ whiteMs: payload.timeLeft.white, blackMs: payload.timeLeft.black, turn: payload.turn, turnStartedAt: payload.timeLeft.turnStartedAt, serverNow: payload.timeLeft.serverNow });
        };

        const handleMoveMade: ServerToClientEvents['move-made'] = (payload) => {
            sync({ whiteMs: payload.timeLeft.white, blackMs: payload.timeLeft.black, turn: payload.turn, turnStartedAt: payload.timeLeft.turnStartedAt, serverNow: payload.timeLeft.serverNow });
            setMoveHistory(prev => {
                const next = [...prev, payload.move.san];
                setCursor(next.length);
                return next;
            });
            setTurn(payload.turn);
        }
        const handleGameOver: ServerToClientEvents['game-over'] = (payload) => {
            stop();
            toast(`${payload.winner} won the game, reason - ${payload.reason}`);
        }

        socket.on('spectate-start', handleSpecStart);
        socket.on('game-over', handleGameOver);
        socket.on('move-made', handleMoveMade);

        return () => {
            socket.off('spectate-start', handleSpecStart);
            socket.off('move-made', handleMoveMade);
            socket.off('game-over', handleGameOver);
        }
    }, [socket, sync, stop]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                setCursor(prev => Math.min(moveHistory.length, prev + 1))
            }
            else if (e.key == "ArrowLeft") {
                setCursor(prev => Math.max(0, prev - 1));
            }
        }

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);

    }, [moveHistory.length])

    const playersInfo = {
        whiteUsername,
        blackUsername,
        whiteTime,
        blackTime,
    };

    const boardState = {
        moveHistory,
        cursor,
        color: null,
        turn,
        isInteractive: false,
    }
    const controls = {
        canResign: false,
        canDraw: false,
        onCursorJump: setCursor,
    }

    return {playersInfo, boardState, controls};
}