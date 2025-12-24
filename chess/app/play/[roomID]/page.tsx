"use client";

import Clock from "@/components/Clock";
import MoveHistory from "@/components/MoveHistory";
import { useAuth } from "@/hooks/useAuth";
import { useChessClock } from "@/hooks/useChessClock";
import { useChessGame } from "@/hooks/useChessGame";
import { useSocket } from "@/hooks/useSocket";
import { ServerToClientEvents } from "@/types/socketEvents";
import { Square } from "chess.js";
import { Clock10, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import { toast } from "sonner";

export default function Game() {
    const { socket } = useSocket();
    const { username: myUsername } = useAuth();
    const { roomID } = useParams<{ roomID: string }>();

    const { whiteTime, blackTime, sync, pause, timedOut } = useChessClock();

    const [oppUsername, setOppUsername] = useState<string | null>(null);

    // GAME STATES
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [cursor, setCursor] = useState(moveHistory.length);
    const [color, setColor] = useState<'white' | 'black' | null>(null);
    const [turn, setTurn] = useState<'white' | 'black'>('white');

    const { position, isMyTurn, tryMakeMove, getLegalMovesFromSquare, getPiece } = useChessGame({
        moveHistory,
        cursor,
        myColor: color,
        turn,
    });

    // states for click-move logic
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});

    // Effect 1 - When either player times out, inform the server
    useEffect(() => {
        if (!timedOut) return;

        socket?.emit('game-timeout', { roomID });
        console.log(timedOut);
    }, [timedOut, socket, roomID]);

    // Effect 2: Join room only (runs once per socket/room)
    useEffect(() => {
        if (!socket || !roomID) return;

        socket.emit('join-room', { roomID });
    }, [socket, roomID]);

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

    // TODO - optimistic moves     
    function getMoveOptions(square: Square) {
        if(!isMyTurn) {
            setOptionSquares({});
            return false;
        }

        // get the moves for the square
        const moves = getLegalMovesFromSquare(square);

        // if no moves, clear the option squares
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        // create a new object to store the option squares
        const newSquares: Record<string, React.CSSProperties> = {};

        // loop through the moves and set the option squares
        for (const move of moves) {
            newSquares[move.to] = {
                background: getPiece(move.to) && getPiece(move.to)?.color !== getPiece(square)?.color ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)' // larger circle for capturing
                    : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                // smaller circle for moving
                borderRadius: '50%'
            };
        }

        // set the square clicked to move from to yellow
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)'
        };

        // set the option squares
        setOptionSquares(newSquares);

        // return true to indicate that there are move options
        return true;
    }

    function onSquareClick({
        square,
        piece
    }: SquareHandlerArgs) {
        // piece clicked to move

        if (!moveFrom && piece) {
            // get the move options for the square
            const hasMoveOptions = getMoveOptions(square as Square);

            // if move options, set the moveFrom to the square
            if (hasMoveOptions) {
                setMoveFrom(square);
            }

            // return early
            return;
        }

        // square clicked to move to, check if valid move
        const moves = getLegalMovesFromSquare(moveFrom as Square);
        const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

        // not a valid move
        if (!foundMove) {
            // check if clicked on new piece
            const hasMoveOptions = getMoveOptions(square as Square);

            // if new piece, setMoveFrom, otherwise clear moveFrom
            setMoveFrom(hasMoveOptions ? square : '');

            // return early
            return;
        }

        


        const move = tryMakeMove(moveFrom, square);
        if (!move) {
            // if invalid, setMoveFrom and getMoveOptions
            const hasMoveOptions = getMoveOptions(square as Square);

            // if new piece, setMoveFrom, otherwise clear moveFrom
            if (hasMoveOptions) {
                setMoveFrom(square);
            }

            // return early
            return;
        }
        socket?.emit('make-move', { roomID, move });
        // clear moveFrom and optionSquares
        setMoveFrom('');
        setOptionSquares({});
    }

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
        // clear moveFrom and optionSquares
        setMoveFrom('');
        setOptionSquares({});
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
        onSquareClick,
        squareStyles: optionSquares,
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