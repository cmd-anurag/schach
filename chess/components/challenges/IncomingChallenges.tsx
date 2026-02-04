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
import { Swords } from "lucide-react";
import Challenge from "./Challenge";
import { useState } from "react";
import { useChallenges } from "@/hooks/useChallenges";

export default function IncomingChallenges() {

  const [open, setOpen] = useState(false);
  const {incomingChallenges, acceptIncomingChallenge, rejectIncomingChallenge} = useChallenges();

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
        {incomingChallenges.length === 0 && <NoChallenges />}
        {incomingChallenges.map((e) => <Challenge key={e.fromUsername}
          challenge={e}
          acceptIncomingChallenge={acceptIncomingChallenge}
          rejectIncomingCHallenge={rejectIncomingChallenge}
           />)}
      </SheetContent>
    </Sheet>
  )
}