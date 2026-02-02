"use client";
import { Flame, Rabbit, Turtle, Zap } from "lucide-react";
import { Chessboard } from "react-chessboard";

type Props = {
    gameDetails: {
        baseTime: number,
        increment: number,
        type: 'bullet' | 'blitz' | 'rapid' | 'classical',
        finalPosition: string,
        whiteUsername: string,
        blackUsername: string,
        winner: 'white' | 'black' | 'draw',
        reason: string,
        startedAt: number,
        endedAt: number,
    }
}

function getDate(timeStamp: number) {
    const date = new Date(timeStamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

function getDuration(startedAt: number, endedAt: number) {
    const durationSeconds = (endedAt - startedAt) / 1000;
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = Math.floor(durationSeconds % 60);
    return `${minutes}m ${seconds}s`;
}

function getScore(winner: 'white' | 'black' | 'draw') {
    switch (winner) {
        case 'white': return "1 – 0";
        case 'black': return "0 – 1";
        case 'draw': return "½–½";
        default: return "";
    }
}

function getTypeLogo(type: Props["gameDetails"]["type"]) {
    switch (type) {
        case 'bullet': return <Zap size={16} />;
        case 'blitz': return <Flame size={16} />;
        case 'rapid': return <Rabbit size={16} />;
        case 'classical': return <Turtle size={16} />;
    }
}

export default function FinishedGame({ gameDetails }: Props) {
    const chessboardOptions = {
        position: gameDetails.finalPosition,
        id: 'finished-game',
        allowDragging: false,
        showNotation: false,
    };

    return (
        <div className="
        grid
        grid-cols-[120px_1fr]
        md:grid-cols-[144px_1fr_auto]
        gap-4 md:gap-6
        items-center
        rounded-lg border border-zinc-800
        bg-zinc-900/60
        px-8 py-4 md:py-5
        hover:bg-zinc-900
        transition-colors
        max-w-5xl
    ">
            {/* Board */}
            <div className="
            w-[120px] h-[120px]
            md:w-[144px] md:h-[144px]
            pointer-events-none
        ">
                <Chessboard options={chessboardOptions} />
            </div>

            {/* Main info */}
            <div className="flex flex-col gap-2">
                {/* Time control */}
                <div className="flex items-center gap-2 text-base text-zinc-300">
                    {getTypeLogo(gameDetails.type)}
                    <span>
                        {(gameDetails.baseTime / 60000).toFixed(0)}+
                        {(gameDetails.increment / 1000).toFixed(0)}
                    </span>
                </div>

                {/* Players */}
                <div className="text-lg md:text-xl font-medium text-zinc-100">
                    {gameDetails.whiteUsername}
                    <span className="text-zinc-400"> vs </span>
                    {gameDetails.blackUsername}
                </div>

                {/* Meta: duration + date */}
                <div className="text-sm text-zinc-500">
                    {getDuration(gameDetails.startedAt, gameDetails.endedAt)}
                    <span className="mx-2">•</span>
                    {getDate(gameDetails.startedAt)}
                </div>
            </div>

            {/* Result + reason (right side on desktop) */}
            <div className="
            hidden md:flex
            flex-col items-end
            text-right
            gap-1
        ">
                <div className="text-2xl font-black text-zinc-100">
                    {getScore(gameDetails.winner)}
                </div>
                <div className="text-lg text-zinc-400">
                    {gameDetails.reason}
                </div>
            </div>

            {/* Result + reason (mobile) */}
            <div className="
            md:hidden
            col-span-2
            flex items-center gap-3
            text-base text-zinc-300
            pt-1
        ">
                <span className="font-semibold">
                    {getScore(gameDetails.winner)}
                </span>
                <span className="text-zinc-500">•</span>
                <span>{gameDetails.reason}</span>
            </div>
        </div>
    );




}
