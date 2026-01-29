"use client";

import PlayersInfo from "@/components/PlayersInfo"
import Board from "@/components/Board"
import MoveHistory from "@/components/MoveHistory"
import { Dispatch, SetStateAction, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpDown } from "lucide-react";
import { Move } from "chess.js";
import { ResignButton } from "./ResignButton";
import { DrawButton } from "./DrawButton";

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
        onCursorJump: Dispatch<SetStateAction<number>>;
        onResign?: () => void,
        canResign: boolean,
        canDraw: boolean,
    }

    gameID: string, // a temp prop for draw button, havent thought of a way to refactor draw yet
}

export default function GameViewer({ playersInfo, boardState, controls, gameID }: Props) {
    const [orientation, setOrientation] = useState<'white' | 'black'>('white');
    const [prevColor, setPrevColor] = useState(boardState.color);

    if(boardState.color && boardState.color !== prevColor) {
        setPrevColor(boardState.color);
        setOrientation(boardState.color);
    }

    const toggleOrientation = () => {
        if (orientation === 'white') setOrientation('black');
        else setOrientation('white');
    }

    return (
        <div>
            <div className="flex flex-col lg:flex-row items-center justify-around gap-4 p-4 min-h-[80vh]">

                <PlayersInfo
                    whiteUsername={playersInfo.whiteUsername ?? ''}
                    blackUsername={playersInfo.blackUsername ?? ''}
                    whiteTime={playersInfo.whiteTime}
                    blackTime={playersInfo.blackTime}
                    orientation={orientation} />

                {/* Board Section */}
                <div className="w-full max-w-[90vw] lg:max-w-none lg:h-[80vh] flex items-center justify-center">
                    <Board boardState={{ ...boardState, orientation: orientation, }} onMove={controls.onMove} />
                </div>

                {/* History Section */}
                <div className="border w-full lg:w-[400px] h-[50vh] lg:h-[80vh] flex flex-col justify-between rounded-lg p-4 lg:p-10">
                    <div className="overflow-y-auto flex-grow">
                        <MoveHistory
                            moves={boardState.moveHistory}
                            currentIndex={boardState.cursor}
                            onJump={controls.onCursorJump}
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center items-center gap-2 lg:gap-4  bg-background">
                        <ResignButton canResign={controls.canResign} onResign={controls.onResign} />
                        <DrawButton canDraw={controls.canDraw} gameID={gameID}/>
                        <button onClick={toggleOrientation} className="px-3 py-2 rounded-lg border hover:bg-slate-800 transition-colors">
                            <ArrowUpDown />
                        </button>
                        <button className="px-3 py-2 rounded-lg border hover:bg-slate-800 transition-colors" onClick={() => controls.onCursorJump(prev => Math.max(0, prev - 1))}><ArrowLeft /></button>
                        <button className="px-3 py-2 rounded-lg border hover:bg-slate-800 transition-colors" onClick={() => controls.onCursorJump(prev => Math.min(boardState.moveHistory.length, prev + 1))}><ArrowRight /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}
