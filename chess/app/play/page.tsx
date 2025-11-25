"use client";

import { useEffect, useState } from "react";
import { Chessboard, type PieceDropHandlerArgs } from "react-chessboard";
import { useSearchParams, useRouter } from "next/navigation";
import {
  initSocket,
  sendMove,
  joinRoom,
  onPlayerColor,
  onOpponentMove,
  onMoveHistory,
  onRoomState,
  onOpponentLeft,
  cleanupSocket,
} from "@/lib/gameClient";

import { getToken } from "@/lib/auth";
import { useChessGame } from "@/lib/useChessGame";
import { Move } from "chess.js";

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomID = searchParams.get("room");

  const [waiting, setWaiting] = useState(true);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black" | undefined>();


  const {
    position,
    color,
    gameOver,
    setPlayerColor,
    tryMakeMove,
    isMyTurnToMove,
    applyOpponentMove,
    loadMoveHistory,
  } = useChessGame();

  //
  // PRE-FLIGHT VALIDATION
  //
  useEffect(() => {
    if (!roomID) {
      // strict: no room param means no game
      router.replace("/lobby");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      initSocket(token);
    } catch (err) {
      console.error("Failed to initialize socket:", err);
      router.replace("/login");
      return;
    }
  }, [roomID, router]);

  //
  // SOCKET + GAME INIT
  //
  useEffect(() => {
    if (!roomID) return;

    // join the server-side room (server will check auth)
    joinRoom(roomID);

    const playerColorHandler = (c: "white" | "black") => {
      setPlayerColor(c);
      setBoardOrientation(c);
    };
    const opponentJoinedHandler = () => setWaiting(false);
    const opponentMoveHandler = (move: Move) => applyOpponentMove(move);
    const moveHistoryHandler = ({ moves }: { moves: Move[] }) => loadMoveHistory(moves);

    const roomStateHandler = (state: any) => {
      if (state.whiteConnected && state.blackConnected) setWaiting(false);
    };

    const opponentLeftHandler = () => {
      alert("Opponent left the match.");
      setWaiting(true);
    };

    // register listeners (use gameClient "on..." helpers)
    onPlayerColor(playerColorHandler);
    // server also emits an 'opponent-joined' event in gameplay — handle it via roomState or you can listen directly:
    // if server emits 'opponent-joined', you can also do: getSocket().on('opponent-joined', opponentJoinedHandler)
    onOpponentMove(opponentMoveHandler);
    onMoveHistory(moveHistoryHandler);
    onRoomState(roomStateHandler);
    onOpponentLeft(opponentLeftHandler);

    // If the server doesn't explicitly send "opponent-joined", we rely on roomState to detect both connected.

    return () => {
      // remove listeners and optionally disconnect socket if you want
      // cleanupSocket() disconnects entire socket and removes all listeners;
      // if you want to only remove the listeners added here, you'd need an "off" API in gameClient.
      // For simplicity and safety we call cleanupSocket() to fully clean up when leaving the page.
      cleanupSocket();
    };
  }, [roomID]);

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (waiting) return false;
    if (!isMyTurnToMove()) return false;

    const move = tryMakeMove(sourceSquare, targetSquare!);
    if (!move) return false;

    sendMove(roomID!, move);

    return true;
  }

  const chessboardOptions = {
    position,
    onPieceDrop,
    id: "live-game",
    boardStyle: {
      width: "40%",
    },
    boardOrientation,
  };

  if (!roomID) {
    return (
      <div style={{ padding: 40 }}>
        <h2>No room specified.</h2>
        <p>You must join a match via the lobby challenge system.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2>Room: {roomID}</h2>
        {color && <p>You are playing as <strong>{color}</strong></p>}
        <p>
          {waiting
            ? "Waiting for opponent..."
            : isMyTurnToMove()
              ? "Your turn"
              : "Opponent's turn"}
        </p>
        {gameOver ? <h2>Game Over</h2> : null}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <Chessboard options={chessboardOptions} />
      </div>
    </>
  );
}
