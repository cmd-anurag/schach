"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import NoChallenges from "./NoChallenges"
import { useEffect, useState } from "react"
import { useSocket } from "@/hooks/useSocket";
import { ServerToClientEvents } from "@/types/socketEvents";
import { toast } from "sonner";
import { Swords } from "lucide-react";

type IncomingChallenge = {fromUsername: string, color: 'white' | 'black' | 'random'}

export default function IncomingChallenges() {

  const [challenges, setChallenges] = useState<IncomingChallenge[]>([]);
  const {socket} = useSocket();

  useEffect(() => {

    const incomingChallengeHandler: ServerToClientEvents['incoming-challenge'] = ({fromUsername, color}) => {
      
      setChallenges(prev => {
        if(prev.some(c => c.fromUsername === fromUsername)) {
          return prev;
        }
        return [...prev, {fromUsername, color}]
      });

      toast.info(`${fromUsername} challenged you for a battle of wits! Hope you stretched your brain.`, {
        action: {
          label: 'Accept',
          onClick: () => console.log('accepted')
        },
        className: 'bg-green-600',
      });
      console.log(`challenge received from ${fromUsername} pref color = ${color}`);
    };

    socket?.on('incoming-challenge', incomingChallengeHandler);

    return () => {
      socket?.off('incoming-challenge');
    }

  }, [socket]);

  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer"><Swords /></SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Incoming Challenges
          </SheetTitle>
        </SheetHeader>
        <SheetDescription></SheetDescription>
        {challenges.length === 0 && <NoChallenges />}
        {challenges.map((e) => <p key={e.fromUsername}>{e.fromUsername} | {e.color}</p>)}
      </SheetContent>
    </Sheet>
  )
}