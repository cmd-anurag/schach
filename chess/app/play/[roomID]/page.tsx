"use client";

import Clock from "@/components/Clock";
import MoveHistory from "@/components/MoveHistory";
import { useAuth } from "@/hooks/useAuth";
import { useChessClock } from "@/hooks/useChessClock";
import { useChessGame } from "@/hooks/useChessGame";
import { useSocket } from "@/hooks/useSocket";
import { ServerToClientEvents } from "@/types/socketEvents";
import { Clock10, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Chessboard, PieceDropHandlerArgs } from 'react-chessboard';
import { toast } from "sonner";

export default function Game() {
    const { socket } = useSocket();
    const { username } = useAuth();
    const { roomID } = useParams<{ roomID: string }>();

    const { whiteTime, blackTime, sync, pause, timedOut } = useChessClock();

    const [myUsername, setMyUsername] = useState<string | null>(null);
    const [oppUsername, setOppUsername] = useState<string | null>(null);

    // GAME STATES
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [cursor, setCursor] = useState(moveHistory.length);
    const [color, setColor] = useState<'white' | 'black' | null>(null);
    const [turn, setTurn] = useState<'white' | 'black'>('white');

    const { position, isMyTurn, tryMakeMove } = useChessGame({
        moveHistory,
        cursor,
        myColor: color,
        turn,
    });

    // Effect 1 - When either player times out, inform the server
    useEffect(() => {
        if (!timedOut) return;

        socket?.emit('game-timeout', { roomID });
        console.log(timedOut);
    }, [timedOut]);

    // Effect 2: Join room only (runs once per socket/room)
    useEffect(() => {
        if (!socket || !roomID) return;

        setMyUsername(username);
        socket.emit('join-room', { roomID });
    }, [socket, roomID, username]);

    // Effect 3: Event handlers
    useEffect(() => {
        if (!socket) return;

        const handleGameStart: ServerToClientEvents['game-start'] = ({ myColor, opponent, turn, moveHistory, opponentConnected, timeLeft }) => {
            setColor(myColor);
            setMoveHistory(moveHistory);
            setCursor(moveHistory.length);
            setTurn(turn);
            setOppUsername(opponent);
            sync({ whiteMs: timeLeft.white, blackMs: timeLeft.black, turn, turnStartedAt: timeLeft.turnStartedAt });
            if (!opponentConnected) {
                toast.info("Waiting for opponent to connect...");
            }
        };

        const handleMoveMade: ServerToClientEvents['move-made'] = ({ move, turn, byColor, timeLeft }) => {
            sync({ whiteMs: timeLeft.white, blackMs: timeLeft.black, turn, turnStartedAt: timeLeft.turnStartedAt });

            setMoveHistory(prev => {
                const next = [...prev, move.san];
                setCursor(c => (c === prev.length ? next.length : c));
                return next;
            });
            setTurn(turn);
        };

        const handleGameOver: ServerToClientEvents['game-over'] = ({ winner, reason }) => {
            pause();
            toast.info(`Game Over ${winner} won! Reason - ${reason}`);
        };

        const handleRoomError: ServerToClientEvents['room-error'] = ({ message }) => toast.error(message);
        const handleMoveError: ServerToClientEvents['move-error'] = ({ message }) => toast.error(message);

        socket.on('game-start', handleGameStart);
        socket.on('move-made', handleMoveMade);
        socket.on('game-over', handleGameOver);
        socket.on('room-error', handleRoomError);
        socket.on('move-error', handleMoveError);

        return () => {
            socket.off('game-start', handleGameStart);
            socket.off('move-made', handleMoveMade);
            socket.off('game-over', handleGameOver);
            socket.off('room-error', handleRoomError);
            socket.off('move-error', handleMoveError);
        };
    }, [socket, color, sync, pause]);

    // TODO - Click to move and optimistic moves 
    function onPieceDrop({
        sourceSquare,
        targetSquare
    }: PieceDropHandlerArgs) {
        // type narrow targetSquare potentially being null (e.g. if dropped off board)
        if (!targetSquare) {
            return false;
        }

        if (!isMyTurn) {
            toast.error("Not your turn!");
            return false;
        }

        const move = tryMakeMove(sourceSquare, targetSquare);

        if (!move) {
            return false; // Invalid move
        }
        socket?.emit('make-move', { roomID, move });
        return true;
    }

    const boardOrientationColor = color ? color : "white";
    const canDragPiece = ({
        piece,
        square,
        isSparePiece,
    }: {
        piece: { pieceType: string };
        square: string | null;
        isSparePiece: boolean;
    }) => {
        // no dragging spare pieces
        if (isSparePiece) return false;

        // must be live position
        if (cursor !== moveHistory.length) return false;

        // pieceType: 'wP', 'bN', etc
        const pieceColor = piece.pieceType[0] === 'w' ? 'white' : 'black';
        return pieceColor === color;
    };
    // set the chessboard options
    const chessboardOptions = {
        position,
        onPieceDrop,
        boardOrientation: boardOrientationColor,
        canDragPiece,
        id: 'play-vs-random'
    };

    return (
        <div className="flex items-center justify-around">
            <div className="border w-[300px] h-[40vh] p-2 rounded-lg flex justify-around flex-col">
                {/* Opponent */}
                <div>
                    <div className="flex items-center gap-4 p-2">
                        <User fill={color === "white" ? "black" : "white"} />
                        <span className="text-2xl font-bold">{oppUsername}</span>
                    </div>
                    <div className="flex items-center gap-4 p-2">
                        <Clock10 />
                        <Clock timeMs={color === "white" ? blackTime : whiteTime} />
                    </div>
                </div>
                <div className="flex justify-center">
                    <h1 className="font-bold">VS</h1>
                </div>
                {/* Me */}
                <div>
                    <div className="flex items-center gap-4 p-2">
                        <User size={25} fill={color === "white" ? "white" : "black"} />
                        <span className="text-2xl font-bold">{myUsername}</span>
                    </div>
                    <div className="flex items-center gap-4 p-2">
                        <Clock10 size={25} />
                        <Clock timeMs={color === "white" ? whiteTime : blackTime} />
                    </div>
                </div>
            </div>
            <div className="h-screen flex items-center">
                <div className="max-w-180">
                    <Chessboard options={chessboardOptions} />
                </div>
            </div>
            <div className="border w-[400px] h-[80vh]">
                <MoveHistory
                    moves={moveHistory}
                    currentIndex={cursor}
                    onJump={(index: number) => setCursor(index)}
                />
                <button className="p-4 bg-blue-500 text-white cursor-pointer" onClick={() => setCursor(prev => Math.max(0, prev - 1))}>&lt;-</button>
                <button className="p-4 bg-blue-500 text-white cursor-pointer" onClick={() => setCursor(prev => Math.min(moveHistory.length, prev + 1))}>-&gt;</button>
            </div>
        </div>
    );
}