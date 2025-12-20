"use client";

import Clock from "@/components/Clock";
import MoveHistory from "@/components/MoveHistory";
import { useAuth } from "@/hooks/useAuth";
import { useChessClock } from "@/hooks/useChessClock";
import { useChessGame } from "@/hooks/useChessGame";
import { useSocket } from "@/hooks/useSocket";
import { useMoveStore } from "@/lib/moveStore";
import { Clock10, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Chessboard, PieceDropHandlerArgs } from 'react-chessboard';
import { toast } from "sonner";

export default function Game() {
    const { socket } = useSocket();
    const { username } = useAuth();
    const { roomID } = useParams<{ roomID: string }>();

    const { position, color, isMyTurn, initializeGame, tryMakeMove, applyMove } = useChessGame();
    const { whiteTime, blackTime, sync, pause, timedOut } = useChessClock();

    const [myUsername, setMyUsername] = useState<string | null>(null);
    const [oppUsername, setOppUsername] = useState<string | null>(null);
    
    useEffect(() => {
        if(!timedOut) return;

        socket?.emit('game-timeout', {roomID});
        console.log(timedOut);
    }, [timedOut]);

    useEffect(() => {
        if (!socket || !roomID) return;

        setMyUsername(username);

        socket?.on('game-start', ({ roomID, myColor, opponent, turn, moveHistory, opponentConnected, timeLeft }) => {

            initializeGame({ myColor, moveHistory, turn });
            useMoveStore.getState().setMoves(moveHistory);
            setOppUsername(opponent);
            // clock sync
            sync({ whiteMs: timeLeft.white, blackMs: timeLeft.black, turn, turnStartedAt: timeLeft.turnStartedAt })
            if (!opponentConnected) {
                toast.info("Waiting for opponent to connect...");
            }
        });
        socket.on('move-made', ({ move, turn, byColor, timeLeft }) => {
            sync({ whiteMs: timeLeft.white, blackMs: timeLeft.black, turn, turnStartedAt: timeLeft.turnStartedAt });
            if (byColor === color) return; // ignore my own echoed move
            applyMove(move, turn);
            useMoveStore.getState().addMove(move.san);
        });

        socket.on('game-over', ({winner, reason}) => {
            pause();
            toast.info(`Game Over ${winner} won! Reason - ${reason}`);
        })

        socket.on('room-error', ({ message }) => {
            toast.error(message);
        });

        socket.on('move-error', ({ message }) => {
            toast.error(message);
        });

        socket?.emit('join-room', { roomID });
        
        return () => {
            // TOOD - make seperate handlers for them so i dont have to remove all listeners
            // bad code
            socket.off('game-over');
            socket.off('game-start');
            socket.off('move-made');
            socket?.off('room-error');
            socket?.off('move-error');
        }
    }, [socket, roomID]);

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
    // set the chessboard options
    const chessboardOptions = {
        position,
        onPieceDrop,
        boardOrientation: boardOrientationColor,
        id: 'play-vs-random'
    };

    return (
        <div className="flex items-center justify-around">
            <div className="border w-[300px] h-[40vh] p-2 rounded-lg flex justify-around flex-col">
                {/* Opponent */}
                <div>
                    <div className="flex items-center gap-4 p-2">
                        <User fill={color === "white"? "black": "white"} />
                        <span className="text-2xl font-bold">{oppUsername}</span>
                    </div>
                    <div className="flex items-center gap-4 p-2">
                        <Clock10 />
                        <Clock timeMs={color === "white"? blackTime : whiteTime} />
                    </div>
                </div>
                <div className="flex justify-center">
                    <h1 className="font-bold">VS</h1>
                </div>
                {/* Me */}
                <div>
                    <div className="flex items-center gap-4 p-2">
                        <User size={25} fill={color === "white"? "white" : "black"} />
                        <span className="text-2xl font-bold">{myUsername}</span>
                    </div>
                    <div className="flex items-center gap-4 p-2">
                        <Clock10 size={25} />
                        <Clock timeMs={color === "white"? whiteTime : blackTime} />
                    </div>
                </div>
            </div>
            <div className="h-screen flex items-center">
                <div className="max-w-180">
                    <Chessboard options={chessboardOptions} />
                </div>
            </div>
            <div className="border w-[400px] h-[80vh]">
                <MoveHistory />
            </div>
        </div>
    );
}