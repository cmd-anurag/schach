"use client";
import { Chessboard } from "react-chessboard"

type Props = {
    gameDetails: {
        finalPosition: string,
        whiteUsername: string,
        blackUsername: string,
        winner: 'white' | 'black' | 'draw',
        reason: string,
    }
}

function getScore(winner: 'white' | 'black' | 'draw')
{
    switch (winner) {
        case 'white':
            return "1-0";
        case 'black':
            return "0-1";
        case 'draw':
            return "0.5-0.5";
        default:
            break;
    }
    return "0-0";
}

export default function FinishedGame({ gameDetails }: Props) {
    const chessboardOptions = {
        position: gameDetails.finalPosition,
        id: 'finished-game',
        allowDragging: false,
        showNotation: false,
    }
    return (
        <div className="flex items-center">
            <div className="w-[150px] h-[150px] pointer-events-none p-4">
                <Chessboard options={chessboardOptions} />
            </div>
            <div>
                <p>
                    {gameDetails.whiteUsername} vs {gameDetails.blackUsername}
                </p>
                <p>
                    {getScore(gameDetails.winner)} | {gameDetails.reason}
                </p>
            </div>
        </div>
    )
}
