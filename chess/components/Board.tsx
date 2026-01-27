"use client";

import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { useChessGame } from "@/hooks/useChessGame";
import { Chess, Move, Square } from "chess.js";
import PromotionSelection from "./PromotionSelection";
import { useState } from "react";

type BoardProps = {
    boardState: {
        moveHistory: string[],
        cursor: number,
        color: 'white' | 'black' | null,
        turn: 'white' | 'black',
        gameFinished: boolean,
    },
    onMove?: (move: Move) => void;
}

export default function Board({ boardState, onMove }: BoardProps) {

    const { moveHistory, cursor, turn, color, gameFinished } = boardState;

    // states for click-move logic
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});

    // promotion state
    const [pendingPromotion, setPendingPromotion] = useState<null | Move>(null);
    const promotionAnchor = pendingPromotion ? (document.querySelector(
        `[data-square="${pendingPromotion.to}"]`
    ) as HTMLElement | null) : null;

    const { position, isMyTurn, tryMakeMove, getLegalMovesFromSquare, getPiece } = useChessGame({
        moveHistory,
        cursor,
        myColor: color,
        turn,
    });

    function finalizePromotion(piece: 'q' | 'r' | 'b' | 'n') {
        if (!pendingPromotion) return;
        const temp = new Chess(position);
        const tempMove = temp.move({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: piece });
        onMove?.(tempMove);
        setPendingPromotion(null);
    }

    function getMoveOptions(square: Square) {

        if (!isMyTurn) {
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
        if (gameFinished) return;
        if (pendingPromotion) return;

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

        const moveResult = tryMakeMove(moveFrom, square);
        if (!moveResult) {
            // if invalid, setMoveFrom and getMoveOptions
            const hasMoveOptions = getMoveOptions(square as Square);

            // if new piece, setMoveFrom, otherwise clear moveFrom
            if (hasMoveOptions) {
                setMoveFrom(square);
            }

            // return early
            return;
        }

        if (moveResult.type === 'promotion') {
            setPendingPromotion(moveResult.move);
            setMoveFrom('');
            setOptionSquares({});
            return;
        }
        onMove?.(moveResult.move);
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
            return false;
        }

        if (pendingPromotion) return false;

        const moveResult = tryMakeMove(sourceSquare, targetSquare);

        if (!moveResult) {
            return false; // Invalid move
        }

        if (moveResult.type == 'promotion') {
            setPendingPromotion(moveResult.move);
            return false;
        }

        // optimism
        onMove?.(moveResult.move);

        // clear moveFrom and optionSquares
        setMoveFrom('');
        setOptionSquares({});
        return true;
    }

    const boardOrientationColor = color ? color : "white";
    const canDragPiece = ({
        piece,
        isSparePiece,
    }: {
        piece: { pieceType: string };
        square: string | null;
        isSparePiece: boolean;
    }) => {

        // no dragging spare pieces
        if (isSparePiece) return false;
        if (pendingPromotion) return false;
        if (gameFinished) return false;

        // must be live position
        if (cursor !== moveHistory.length) return false;

        // pieceType: 'wP', 'bN', etc
        const pieceColor = piece.pieceType[0] === 'w' ? 'white' : 'black';
        return pieceColor === color;
    };

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
        <div className="max-w-180">
            <PromotionSelection open={!!pendingPromotion} anchorElement={promotionAnchor} onSelect={finalizePromotion} onCancel={() => setPendingPromotion(null)} />
            <Chessboard options={chessboardOptions} />
        </div>
    );
}