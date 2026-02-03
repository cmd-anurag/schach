"use client";

import { Move } from "chess.js";
import { useEffect, useState } from "react";
import GameViewer from "./GameViewer";

type Props = {
    playersInfo: {
        whiteUsername: string | null,
        blackUsername: string | null,
        whiteTime: number,
        blackTime: number,
    }
    boardState: {
        moveHistory: string[],
        cursor: number,
        color: 'white' | 'black' | null;
        turn: 'white' | 'black',
        isInteractive: boolean,
    }
    controls: {
        onMove?: (move: Move) => void,
        onResign?: () => void,
        canResign: boolean,
        canDraw: boolean,
    }

    gameID: string, // a temp prop for draw button, havent thought of a way to refactor draw yet
}

export default function ViewGameClient({ playersInfo, boardState, controls, gameID }: Props) {

    const [cursor, setCursor] = useState(boardState.moveHistory.length);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                setCursor(prev => Math.min(boardState.moveHistory.length, prev + 1))
            }
            else if (e.key == "ArrowLeft") {
                setCursor(prev => Math.max(0, prev - 1));
            }
        }

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);

    }, [boardState.moveHistory.length]);

    return (
        <GameViewer
            playersInfo={playersInfo}
            boardState={{ ...boardState, cursor }}
            controls={{ ...controls, onCursorJump: setCursor }}
            gameID={gameID}
        />
    )
}
