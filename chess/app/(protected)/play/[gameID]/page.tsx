"use client";

import Board from "@/components/Board";
import Clock from "@/components/Clock";
import { DrawButton } from "@/components/DrawButton";
import MoveHistory from "@/components/MoveHistory";
import { ResignButton } from "@/components/ResignButton";
import { useAuth } from "@/hooks/useAuth";
import { useChessClock } from "@/hooks/useChessClock";
import { useSocket } from "@/hooks/useSocket";
import { MoveIntent, ServerToClientEvents } from "@/types/socketEvents";
import { Move } from "chess.js";
import { ArrowLeft, ArrowRight, Clock10, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Game() {

    const { socket } = useSocket();
    const { user } = useAuth();
    const myUsername = user?.username;
    const { gameID } = useParams<{ gameID: string }>();

    const { whiteTime, blackTime, sync, stop, timedOut } = useChessClock();

    const [oppUsername, setOppUsername] = useState<string | null>(null);

    // GAME STATES
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [cursor, setCursor] = useState(moveHistory.length);
    const [color, setColor] = useState<'white' | 'black' | null>(null);
    const [turn, setTurn] = useState<'white' | 'black'>('white');
    const [gameFinished, setGameFinished] = useState(false);

    // Optimism
    const optimisticMoveRef = useRef<MoveIntent | null>(null);
    const addOptimisticMove = (move: Move, moveID: number) => {
        const intent: MoveIntent = { from: move.from, to: move.to, clientMoveID: moveID };

        setMoveHistory(prev => {
            const next = [...prev, move.san];
            setCursor(next.length);
            return next;
        });

        optimisticMoveRef.current = intent;
    }

    // Effect 1 - When either player times out, inform the server
    useEffect(() => {
        if (!timedOut) return;

        socket?.emit('game-timeout', { gameID });
        console.log(timedOut);
    }, [timedOut, socket, gameID]);

    // Effect 2: Join game only (runs once per socket/game)
    useEffect(() => {
        if (!socket || !gameID) return;

        socket.emit('join-game', { gameID });
    }, [socket, gameID]);

    // Effect 3: Socket Event handlers
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
            toast.info(`Game Over ${winner} won! Reason - ${reason}`);
        };

        const handleJoinError: ServerToClientEvents['join-error'] = ({ message }) => toast.error(message);
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
    }, [socket, color, sync, stop]);

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


    return (
        
        <div className="flex flex-col lg:flex-row items-center justify-around gap-4 p-4 min-h-[80vh]">

            {/* Player Info Section */}
            {/* Width is 100% on mobile (w-full), 400px on large screens (lg:w-[400px]) */}
            <div className="border w-full lg:w-[400px] h-auto lg:h-[40vh] p-4 rounded-lg flex flex-row lg:flex-col justify-around items-center lg:items-stretch">
                {/* Opponent */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <User fill={color === "white" ? "black" : "white"} />
                        <span className="text-lg lg:text-xl font-bold">{oppUsername}</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Clock10 size={20} />
                        <Clock timeMs={color === "white" ? blackTime : whiteTime} />
                    </div>
                </div>

                <div className="hidden lg:flex justify-center">
                    <h1 className="font-bold">VS</h1>
                </div>

                {/* Me */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <User size={25} fill={color === "white" ? "white" : "black"} />
                        <span className="text-lg lg:text-xl font-bold">{myUsername}</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Clock10 size={25} />
                        <Clock timeMs={color === "white" ? whiteTime : blackTime} />
                    </div>
                </div>
            </div>

            {/* Board Section */}
            <div className="w-full max-w-[90vw] lg:max-w-none lg:h-[80vh] flex items-center justify-center">
                <Board boardState={{ moveHistory, cursor, turn, color, gameFinished }} gameID={gameID} addOptimisticMove={addOptimisticMove} />
            </div>

            {/* History Section */}
            <div className="border w-full lg:w-[400px] h-[50vh] lg:h-[80vh] flex flex-col justify-between rounded-lg p-4 lg:p-10">
                <div className="overflow-y-auto flex-grow">
                    <MoveHistory
                        moves={moveHistory}
                        currentIndex={cursor}
                        onJump={(index: number) => setCursor(index)}
                    />
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center gap-2 lg:gap-4  bg-background">
                    <DrawButton gameID={gameID} />
                    <ResignButton gameID={gameID} />
                    <button className="px-3 py-2 rounded-lg border hover:bg-slate-800 transition-colors" onClick={() => setCursor(prev => Math.max(0, prev - 1))}><ArrowLeft /></button>
                    <button className="px-3 py-2 rounded-lg border hover:bg-slate-800 transition-colors" onClick={() => setCursor(prev => Math.min(moveHistory.length, prev + 1))}><ArrowRight /></button>
                </div>
            </div>
        </div>
    );
}