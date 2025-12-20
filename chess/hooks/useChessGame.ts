import { useRef, useState } from "react";
import { Chess, Move } from "chess.js";

export function useChessGame() {
  const chessRef = useRef(new Chess());

  const [position, setPosition] = useState(chessRef.current.fen());
  const [color, setColor] = useState<"white" | "black" | null>(null);
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [gameOver, setGameOver] = useState(false);

  function initializeGame(data: {
    myColor:'white' | 'black',
    moveHistory: string[],
    turn: 'white' | 'black',
  }) {
    const game = chessRef.current;
    game.reset();

    for(const move of data.moveHistory) {
      try {
        game.move(move);
      } catch (err) {
        console.log('Invalid Move in history', err, move);
        break;
      }
    }

    setColor(data.myColor);
    setTurn(data.turn);
    setPosition(game.fen());
    setGameOver(game.isGameOver());
  }

  function applyMove(move: Move, newTurn: 'white' | 'black') {
    const game = chessRef.current;
    try {
      game.move(move);
    } catch(err) {
      console.log('Invalid Move from server', err, move);
      return;
    }
    setPosition(game.fen());
    setTurn(newTurn);
    setGameOver(game.isGameOver());
  }

  function tryMakeMove(from: string, to: string): Move | null {
      if (turn !== color) return null;

      const game = chessRef.current;

      let move: Move | null;
      try {
        move = game.move({ from, to, promotion: 'q' });
      } catch {
        return null;
      }
      if (!move) return null;

      // local update for my own move
      setPosition(game.fen());
      setTurn(color === 'white' ? 'black' : 'white');

      return move; // return for server sync
  }


  return {
    position,
    color,
    turn,
    gameOver,
    isMyTurn: turn === color,
    tryMakeMove,
    initializeGame,
    applyMove,
  };
}
