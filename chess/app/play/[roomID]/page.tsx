"use client";

import { useChessGame } from "@/hooks/useChessGame";
import { useSocket } from "@/hooks/useSocket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Chessboard, PieceDropHandlerArgs } from 'react-chessboard';
import { toast } from "sonner";

export default function Game() {
    const { socket } = useSocket();
    const { roomID } = useParams<{ roomID: string }>();

    const [whiteTime, setWhiteTime] = useState(0);
    const [blackTime, setBlackTime] = useState(0);

    const { position, color, isMyTurn, initializeGame, tryMakeMove, applyMove } = useChessGame();

    
    useEffect(() => {
        if (!socket || !roomID) return;

        socket?.on('game-start', ({ roomID, myColor, opponent, turn, moveHistory, opponentConnected, timeLeft }) => {
            initializeGame({ myColor, moveHistory, turn });
            toast.success(`Playing as ${myColor} vs ${opponent}`);
            setWhiteTime(timeLeft.white / 1000);
            setBlackTime(timeLeft.black / 1000);

            if (!opponentConnected) {
                toast.info("Waiting for opponent to connect...");
            }
        });

        socket.on('move-made', ({ move, turn: newTurn, byColor, timeLeft }) => {

            setWhiteTime(timeLeft.white / 1000);
            setBlackTime(timeLeft.black / 1000);
            if (byColor === color) return; // ignore my own echoed move
            applyMove(move, newTurn);
        });

        socket.on('opponent-connected', () => {
            toast.success('Opponent Connected');
        })
        socket.on('opponent-disconnected', () => {
            toast.warning('Opponent disconnected');
        })

        socket.on('room-error', ({ message }) => {
            toast.error(message);
        });

        socket.on('move-error', ({ message }) => {
            toast.error(message);
        });

        socket?.emit('join-room', { roomID });
        return () => {
            socket.off('game-over');
            socket.off('game-start');
            socket.off('opponent-connected');
            socket.off('opponent-disconnected');
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

    const boardOrientationColor = color? color : "white";
    // set the chessboard options
    const chessboardOptions = {
        position,
        onPieceDrop,
        boardOrientation: boardOrientationColor,
        id: 'play-vs-random'
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-full max-w-2xl">
                <div className="mb-4 text-center">
                    <p className="text-lg">
                        You are playing as <strong>{color}</strong>
                    </p>
                    <p className={isMyTurn ? "text-green-600 font-bold" : "text-gray-500"}>
                        {isMyTurn ? "Your turn" : "Opponent's turn"}
                    </p>
                    <p>White Time Left: {whiteTime}</p>
                    <p>Black Time Left: {blackTime}</p>
                </div>

                <Chessboard
                    options={chessboardOptions}
                />
            </div>
        </div>
    );
}

// TODO - Server side clocks are done , make clocks for client 