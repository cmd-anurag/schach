"use client";

import { useEffect, useState } from "react";
import { useChessGame } from "@/lib/useChessGame";
import { Chessboard, type PieceDropHandlerArgs } from "react-chessboard";
import { useSearchParams } from "next/navigation";
import { 
  cleanupSocketListeners, 
  joinRoom, 
  addOnOpponentJoined, 
  addOnOpponentLeft, 
  addOnOpponentMove, 
  addOnPlayerColor, 
  sendMove 
} from "@/lib/gameClient";


export default function PlayPage() {

  const searchParams = useSearchParams();
  const [roomID, setRoomID] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(true);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black" | undefined>();

  const {
    position,
    color,
    myTurn,
    setPlayerColor,
    tryMakeMove,
    isMyTurnToMove,
    applyOpponentMove,
    gameOver,
  } = useChessGame();

  // this is for setting the room id
  useEffect(() => {
    const id = searchParams.get("room") || Math.random().toString(36).substring(2, 8);
    setRoomID(id);
  }, [searchParams]);

  // this adds the socket listeners
  useEffect(() => {
    if (!roomID) return;
    
    joinRoom(roomID);

    addOnPlayerColor((color) => {
      setPlayerColor(color);
      setBoardOrientation(color);
    })

    addOnOpponentJoined(() => setWaiting(false))

    addOnOpponentMove(applyOpponentMove)

    addOnOpponentLeft(() => {
      alert("opponent left");
    })

    return () => cleanupSocketListeners();

  }, [roomID]);

  // piece drop function
  function onPieceDrop({
    sourceSquare,
    targetSquare
  }: PieceDropHandlerArgs) {

    if (!isMyTurnToMove()) return false;
    if(waiting) return false;

    const move = tryMakeMove(sourceSquare, targetSquare ? targetSquare : "a1");
    if (!move) return false;

    if (roomID) {
      sendMove(roomID, move, color!);
    }
    return true;

  }

 // chessboard options
  const chessboardOptions = {
    position,
    onPieceDrop,
    id: "live-game",
    boardStyle: {
      width: "40%",
    },
    boardOrientation,
  };
  const host = typeof window !== "undefined"
            ? window.location.hostname
            : "localhost";
  const inviteLink = `http://${host}:3000/play?room=${roomID}`;

  // render the chessboard

  return (
    <>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2>Room ID: {roomID}</h2>
        {color && <p>You are playing as {color}</p>}
        <p>{myTurn ? "Your turn" : "Opponent's turn"}</p>

        {color === "white" && waiting ? (
          <p>Send this link to your opponent: <br /><code>{inviteLink}</code></p>
        ) : null}
        {gameOver ? <h2>Game Over</h2> : null}
      </div>
      <div>
        <Chessboard options={chessboardOptions} />
      </div>
    </>
  );
}