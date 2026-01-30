"use client";

import GameViewer from "@/components/GameViewer";
import { useSpectate } from "@/hooks/useSpectate";
import { useParams } from "next/navigation";


export default function SpectatePlayer() {
    const { username } = useParams<{ username: string }>();
    const { playersInfo, boardState, controls } = useSpectate({ username });

    return (
        <GameViewer playersInfo={playersInfo} boardState={boardState} controls={controls} />
    )
}
