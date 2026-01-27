"use client";

import Board from "@/components/Board";
import { DrawButton } from "@/components/DrawButton";
import MoveHistory from "@/components/MoveHistory";
import PlayersInfo from "@/components/PlayersInfo";
import { ResignButton } from "@/components/ResignButton";
import { useAuth } from "@/hooks/useAuth";
import { useLiveGame } from "@/hooks/useLiveGame";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";

export default function Game() {

    const { user } = useAuth();
    const myUsername = user?.username;
    const { gameID } = useParams<{ gameID: string }>();

    const {boardProps, historyProps, playersInfo} = useLiveGame({gameID});


    return (

        <div className="flex flex-col lg:flex-row items-center justify-around gap-4 p-4 min-h-[80vh]">

            <PlayersInfo myUsername={myUsername ?? ''} oppUsername={playersInfo.oppUsername ?? ''} whiteTime={playersInfo.whiteTime} blackTime={playersInfo.blackTime} myColor={boardProps.boardState.color ?? 'white'} />

            {/* Board Section */}
            <div className="w-full max-w-[90vw] lg:max-w-none lg:h-[80vh] flex items-center justify-center">
                <Board boardState={{ ...boardProps.boardState }} onMove={boardProps.onMove} />
            </div>

            {/* History Section */}
            <div className="border w-full lg:w-[400px] h-[50vh] lg:h-[80vh] flex flex-col justify-between rounded-lg p-4 lg:p-10">
                <div className="overflow-y-auto flex-grow">
                    <MoveHistory
                        moves={historyProps.moves}
                        currentIndex={historyProps.currentIndex}
                        onJump={historyProps.onJump}
                    />
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center gap-2 lg:gap-4  bg-background">
                    <DrawButton gameID={gameID} />
                    <ResignButton gameID={gameID} />
                    <button className="px-3 py-2 rounded-lg border hover:bg-slate-800 transition-colors" onClick={() => historyProps.onJump(prev => Math.max(0, prev - 1))}><ArrowLeft /></button>
                    <button className="px-3 py-2 rounded-lg border hover:bg-slate-800 transition-colors" onClick={() => historyProps.onJump(prev => Math.min(historyProps.moves.length, prev + 1))}><ArrowRight /></button>
                </div>
            </div>
        </div>
    );
}