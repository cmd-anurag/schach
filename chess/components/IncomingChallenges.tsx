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
import Challenge from "./Challenge";
import { useRouter } from "next/navigation";

type IncomingChallenge = {fromUsername: string, color: 'white' | 'black' | 'random'}

export default function IncomingChallenges() {

  const [challenges, setChallenges] = useState<IncomingChallenge[]>([]);
  const [open, setOpen] = useState(false);
  const {socket} = useSocket();
  const router = useRouter();

  const removeChallenge = (username: string) => {
    setChallenges(prev => prev.filter(challenge => username !== challenge.fromUsername));
  }

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
          label: 'View All',
          onClick: () => setOpen(true),
        },
      });
      console.log(`challenge received from ${fromUsername} pref color = ${color}`);
    };

    const challengeRejectedHandler: ServerToClientEvents['challenge-rejected'] = ({by}) => {
      console.log(`${by} rejected your challenge.`);
      toast.info(`${by} rejected your challenge.`);
    }

    const challengeAcceptedHandler: ServerToClientEvents['challenge-accepted'] = ({roomID, color, opponent}) => {
      toast.success(`Starting your game with ${opponent}...`);
      
      setTimeout(() => {
        console.log("redirect to playing area");
        router.push(`/play/${roomID}`);
      }, 2000);
    }

    socket?.on('incoming-challenge', incomingChallengeHandler);
    socket?.on('challenge-rejected', challengeRejectedHandler);
    socket?.on('challenge-accepted', challengeAcceptedHandler);

    return () => {
      socket?.off('incoming-challenge', incomingChallengeHandler);
      socket?.off('challenge-rejected', challengeRejectedHandler);
      socket?.off('challenge-accepted', challengeAcceptedHandler);
    }

  }, [socket]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="cursor-pointer"><Swords /></SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Incoming Challenges
          </SheetTitle>
        </SheetHeader>
        <SheetDescription></SheetDescription>
        {challenges.length === 0 && <NoChallenges />}
        {challenges.map((e) => <Challenge key={e.fromUsername} fromUsername={e.fromUsername} color={e.color} remove={() => removeChallenge(e.fromUsername)} />)}
      </SheetContent>
    </Sheet>
  )
}