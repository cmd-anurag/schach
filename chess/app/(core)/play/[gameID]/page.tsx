"use client";

import GameViewer from "@/components/GameViewer";
import { useLiveGame } from "@/hooks/useLiveGame";
import { useParams } from "next/navigation";

export default function Game() {

    const { gameID } = useParams<{ gameID: string }>();
    const {boardState, playersInfo, controls} = useLiveGame({gameID});

    return (
        <GameViewer 
            boardState={{...boardState, isInteractive: true}} 
            playersInfo={playersInfo} 
            controls={controls}
            gameID={gameID}
        />
    );
}