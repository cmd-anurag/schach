"use client";

import GameViewer from "@/components/GameViewer";
import { useSpectate } from "@/hooks/useSpectate";
import { useParams } from "next/navigation";

export default function SpectateGame() {

    const { gameID } = useParams<{ gameID: string }>();
    const { playersInfo, boardState, controls } = useSpectate({ gameID });

    return (
        <GameViewer playersInfo={playersInfo} boardState={boardState} controls={controls} gameID={gameID} />
    )
}
