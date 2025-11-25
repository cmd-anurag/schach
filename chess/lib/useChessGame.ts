import { useRef, useState } from "react";
import { Chess, Move } from "chess.js";

export function useChessGame() {
  const chessRef = useRef(new Chess());

  const [position, setPosition] = useState(chessRef.current.fen());
  const [myTurn, setMyTurn] = useState(false);
  const [color, setColor] = useState<"white" | "black" | null>(null);
  const [gameOver, setGameOver] = useState(false);

  function updateMyTurn(nextColor = color) {
    if (!nextColor) {
      setMyTurn(false);
      return;
    }
    const game = chessRef.current;
    const currentTurn = game.turn() === "w" ? "white" : "black";
    setMyTurn(currentTurn === nextColor);
  }

  function setPlayerColor(c: "white" | "black") {
    setColor(c);
    updateMyTurn(c);
  }

  function applyOpponentMove(move: Move) {
    const game = chessRef.current;

    try {
      game.move(move);
    } catch (err) {
      console.error("applyOpponentMove: invalid move from server", err, move);
      return;
    }

    setPosition(game.fen());
    setGameOver(game.isGameOver());
    updateMyTurn();
  }

  function tryMakeMove(from: string, to: string) {
    const game = chessRef.current;
    let move: Move | null;

    try {
      move = game.move({ from, to, promotion: "q" });
    } catch {
      return null;
    }

    if (!move) return null;

    setPosition(game.fen());
    setGameOver(game.isGameOver());
    updateMyTurn();

    return move;
  }

  function isMyTurnToMove() {
    if (!color) return false;
    const game = chessRef.current;
    const currentTurn = game.turn() === "w" ? "white" : "black";
    return currentTurn === color;
  }

  function loadMoveHistory(moves: Move[]) {
    const game = chessRef.current;

    if (!moves || moves.length === 0) {
      // reset to initial
      game.reset();
      setPosition(game.fen());
      setGameOver(false);
      updateMyTurn();
      return;
    }

    game.reset();

    for (const move of moves) {
      try {
        game.move(move);
      } catch (err) {
        console.log("invalid move in history, stopping replay", err, move);
        break;
      }
    }

    setPosition(game.fen());
    setGameOver(game.isGameOver());
    updateMyTurn();
  }

  return {
    position,
    color,
    myTurn,
    gameOver,
    setPlayerColor,
    tryMakeMove,
    isMyTurnToMove,
    applyOpponentMove,
    loadMoveHistory,
  };
}
