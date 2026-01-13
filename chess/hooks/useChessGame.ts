import { useMemo } from "react";
import { Chess, Move, Piece, Square } from "chess.js";

type Color = 'white' | 'black' | null;
type MoveResult = {
  type: 'normal' | 'promotion',
  move: Move,
}

export function useChessGame(params: {
  moveHistory: string[],
  cursor: number,
  myColor: Color,
  turn: 'white' | 'black',
}) {

  const {moveHistory, cursor, myColor, turn} = params;

  // Compute position synchronously during render using useMemo
  const chess = useMemo(() => {
    const game = new Chess();
    const movesToApply = moveHistory.slice(0, Math.max(0, Math.min(cursor, moveHistory.length)));

    for (const move of movesToApply) {
      try {
        game.move(move);
      } catch (err) {
        console.log('Invalid move in history', err);
        break;
      }
    }
    return game;
  }, [moveHistory, cursor]);

  // DERIVED STATES - now all computed from the same chess instance
  const position = chess.fen();
  const gameOver = chess.isGameOver();
  const isMyTurn = myColor !== null && turn === myColor && cursor === moveHistory.length;
  const legalMovesVerbose = chess.moves({ verbose: true });

  function getPiece(square: Square) : Piece | undefined {
    return chess.get(square);
  }

  function getLegalMovesFromSquare(square: Square) : Move[]{
    return chess.moves({square, verbose: true});
  }

  function validateMove(from: string, to: string, promotion = "q"): MoveResult | null {
    try {
      const temp = new Chess(chess.fen());
      const mv = temp.move({ from, to, promotion });
      if(mv) {
        return {
          move: mv,
          type: mv.isPromotion()? 'promotion' : 'normal', 
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  function tryMakeMove(from: string, to: string): MoveResult | null {
    if (!isMyTurn) return null;
    return validateMove(from, to);
  }

  return {
    position,
    gameOver,
    isMyTurn,
    legalMovesVerbose,
    getPiece,
    getLegalMovesFromSquare,
    tryMakeMove,
    validateMove,
  };
}
