"use client";

import { createContext, ReactNode, useState } from "react";
import { ChallengeColor, ServerToClientEvents } from "@/types/socketEvents";
import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type IncomingChallenge = {
    fromUsername: string,
    color: ChallengeColor,
    time: number,
    increment: number,
}

type OutgoingChallenge = {
    toUsername: string,
    color: ChallengeColor,
    time: number,
    increment: number,
}
export const ChallengeContext = createContext<{
    acceptIncomingChallenge: (challenge: IncomingChallenge) => void,
    rejectIncomingChallenge: (challenge: IncomingChallenge) => void,
    addOutgoingChallenge: (challenge: OutgoingChallenge) => void,
    incomingChallenges: IncomingChallenge[],
} | null>(null);

export function ChallengeProvider({ children }: { children: ReactNode }) {
    const [incomingChallenges, setIncomingChallenges] = useState<IncomingChallenge[]>([]);
    const { socket } = useSocket();
    const router = useRouter();

    const acceptIncomingChallenge = (challenge: IncomingChallenge) => {
        socket?.emit('accept-challenge', challenge);
        setIncomingChallenges(prev => prev.filter(oldChallenge => oldChallenge.fromUsername !== challenge.fromUsername));
    }

    const rejectIncomingChallenge = (challenge: IncomingChallenge) => {
        socket?.emit('reject-challenge', challenge);
        setIncomingChallenges(prev => prev.filter(oldChallenge => oldChallenge.fromUsername !== challenge.fromUsername));
    }

    const addOutgoingChallenge = (challenge: OutgoingChallenge) => {
        socket?.emit('challenge-user', challenge);
        toast(`Sent a challenge to ${challenge.toUsername}`);
    }

    useEffect(() => {
        if (!socket) return;

        const addIncomingChallenge: ServerToClientEvents['incoming-challenge'] = ({ fromUsername, color, time, increment }) => {

            setIncomingChallenges((prev) => {
                let duplicate = false;
                const next = prev.map((challenge) => {
                    if (challenge.fromUsername === fromUsername) {
                        duplicate = true;
                        return { fromUsername, color, time, increment };
                    } else {
                        return challenge;
                    }
                });

                if (duplicate) {
                    return next;
                } else {
                    return [...next, { fromUsername, color, time, increment }];
                }
            });
        }

        const challengeAcceptedHandler: ServerToClientEvents['challenge-accepted'] = ({ gameID }) => {
            router.push(`/play/${gameID}`);
        }
        const challengeRejectedHandler: ServerToClientEvents['challenge-rejected'] = ({ by }) => {
            toast(`${by} rejected your challenge.`);
        }

        socket.on('incoming-challenge', addIncomingChallenge);
        socket.on('challenge-accepted', challengeAcceptedHandler);
        socket.on('challenge-rejected', challengeRejectedHandler);

        return () => {
            socket.off('incoming-challenge', addIncomingChallenge);
            socket.off('challenge-accepted', challengeAcceptedHandler);
            socket.off('challenge-rejected', challengeRejectedHandler);
        };

    }, [socket, router]);

    return (
        <ChallengeContext.Provider value={
            { acceptIncomingChallenge, rejectIncomingChallenge, addOutgoingChallenge, incomingChallenges }
        }>
            {children}
        </ChallengeContext.Provider>
    )
}