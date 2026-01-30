import { MoveIntent, ServerToClientEvents } from "@/types/socketEvents";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSocket } from "./useSocket";
import { Move } from "chess.js";
import { toast } from "sonner";
import { useChessClock } from "./useChessClock";
import { useAuth } from "./useAuth";

export function useLiveGame({ gameID }: { gameID: string }) {

    const { socket } = useSocket();
    const { whiteTime, blackTime, sync, stop } = useChessClock();


    const [whiteUsername, setWhiteUsername] = useState<string | null>(null);
    const [blackUsername, setBlackUsername] = useState<string | null>(null);

    const { user } = useAuth();
    const myUsername = user?.username ?? null;

    // GAME STATES
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [cursor, setCursor] = useState(moveHistory.length);
    const [color, setColor] = useState<'white' | 'black' | null>(null);
    const [turn, setTurn] = useState<'white' | 'black'>('white');
    const [gameFinished, setGameFinished] = useState(false);

    // OPTIMISM
    const moveIDCounter = useRef(0);
    const optimisticMoveRef = useRef<MoveIntent | null>(null);

    const handleMove = useCallback((move: Move) => {
        if (!socket || gameFinished) return;

        const clientMoveID = ++moveIDCounter.current;

        const intent: MoveIntent = { from: move.from, to: move.to, promotion: move.promotion, clientMoveID: clientMoveID };

        setMoveHistory(prev => {
            const next = [...prev, move.san];
            setCursor(next.length);
            return next;
        });

        optimisticMoveRef.current = intent;

        socket.emit('make-move', {
            gameID,
            move: intent,
        });
    }, [socket, gameFinished, gameID]);

    const handleResign = useCallback(() => {
        socket?.emit('resign-game', { gameID });
    }, [socket, gameID]);



    // Effect 1: Join game only (runs once per socket/game)
    useEffect(() => {
        if (!socket || !gameID) return;

        socket.emit('join-game', { gameID });
    }, [socket, gameID]);

    // Effect 2: Socket Event handlers
    useEffect(() => {
        if (!socket) return;

        const handleGameStart: ServerToClientEvents['game-start'] = ({ myColor, opponent, turn, moveHistory, opponentConnected, timeLeft }) => {
            setColor(myColor);
            setMoveHistory(moveHistory);
            setCursor(moveHistory.length);
            setTurn(turn);

            if (myColor === 'white') {
                setWhiteUsername(myUsername)
                setBlackUsername(opponent);
            } else {
                setWhiteUsername(opponent);
                setBlackUsername(myUsername);
            }

            sync({ whiteMs: timeLeft.white, blackMs: timeLeft.black, turn, turnStartedAt: timeLeft.turnStartedAt });
            if (!opponentConnected) {
                toast.info("Waiting for opponent to connect...");
            }
        };

        const handleMoveMade: ServerToClientEvents['move-made'] = ({ move, moveID, turn, timeLeft }) => {
            sync({ whiteMs: timeLeft.white, blackMs: timeLeft.black, turn, turnStartedAt: timeLeft.turnStartedAt });

            // optimistic move
            setMoveHistory(prev => {
                let next;
                const currentOptimistic = optimisticMoveRef.current;

                if (currentOptimistic && moveID === currentOptimistic.clientMoveID) {
                    optimisticMoveRef.current = null;
                    next = [...prev];
                } else {
                    next = [...prev, move.san];
                }
                setCursor(c => (c === prev.length ? next.length : c));
                return next;
            });
            setTurn(turn);
        };

        const handleGameOver: ServerToClientEvents['game-over'] = ({ winner, reason, }) => {
            stop();
            setGameFinished(true);
            if (winner === 'draw') {
                toast(`The dust settles and its a DRAW by ${reason}`)
            } else {
                toast(`${winner} wins by ${reason}`);
            }
        };

        const handleJoinError: ServerToClientEvents['join-error'] = ({ message }) => {
            toast.error(message)

        };
        const handleMoveError: ServerToClientEvents['move-error'] = ({ message }) => toast.error(message);

        socket.on('game-start', handleGameStart);
        socket.on('move-made', handleMoveMade);
        socket.on('game-over', handleGameOver);
        socket.on('join-error', handleJoinError);
        socket.on('move-error', handleMoveError);

        return () => {
            socket.off('game-start', handleGameStart);
            socket.off('move-made', handleMoveMade);
            socket.off('game-over', handleGameOver);
            socket.off('join-error', handleJoinError);
            socket.off('move-error', handleMoveError);
        };
    }, [socket, color, sync, stop, myUsername]);

    // Effect 4. Keyboard Event handlers
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

    }, [moveHistory.length]);

    return {
        boardState: {
            moveHistory,
            cursor,
            turn,
            color,
        },
        playersInfo: {
            whiteUsername,
            blackUsername,
            whiteTime,
            blackTime,
        },
        controls: {
            canResign: !gameFinished,
            canDraw: !gameFinished,
            onMove: handleMove,
            onResign: handleResign,
            onCursorJump: setCursor,
        },
    };
}