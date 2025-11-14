import { useRef, useState } from "react";
import {Chess, Move } from "chess.js";

export function useChessGame() {
    const chessRef = useRef(new Chess());
    const chess = chessRef.current;

    const [position, setPosition] = useState(chess.fen());
    const [myTurn, setMyTurn] = useState(false);
    const [color, setColor] = useState<'white' | 'black' | null>(null);


    function setPlayerColor(color: 'white' | 'black') {
        setColor(color);
        setMyTurn(color == "white");
    }

    function applyOpponentMove(move: Move) {
        chess.move(move);
        setPosition(chess.fen());
        setMyTurn(true);
    }

    function tryMakeMove(from: string, to: string) {
        let move;
        try {
            move = chess.move({from, to, promotion: 'q'});
        } catch {
            return null;
        }
        if(!move) return null;

        setPosition(chess.fen());
        setMyTurn(false);
        return move;
    }

    function isMyTurnToMove() {
        if(!color) return false;
        const currentTurn = chess.turn() === 'w'? "white" : "black";
        return myTurn && currentTurn === color;
    }

    return {
        position, 
        color,
        myTurn,
        setPlayerColor,
        tryMakeMove,
        isMyTurnToMove,
        applyOpponentMove,
    };
}