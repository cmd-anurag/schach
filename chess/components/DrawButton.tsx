import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"
import { useSocket } from "@/hooks/useSocket"
import { Check, Handshake, X } from "lucide-react"
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function DrawButton({ gameID, canDraw }: { gameID?: string, canDraw: boolean }) {
  const { socket } = useSocket();

  const [pendingDraw, setPendingDraw] = useState(false);

  const offerDraw = () => {
    if(gameID) {
      socket?.emit('offer-draw', { gameID });
      toast(`Sent a Draw Offer to opponent`);
    }
  }

  const acceptDraw = () => {
    if(gameID) {
      socket?.emit('accept-draw', { gameID });
      setPendingDraw(false);
    }
  }

  const rejectDraw = () => {
    if(gameID) {
      socket?.emit('reject-draw', { gameID });
      setPendingDraw(false);
    }
  }

  const handleIncomingDraw = () => {
    toast('Opponent sent you a draw offer');
    setPendingDraw(true);
  }

  useEffect(() => {
    socket?.on('incoming-draw-offer', handleIncomingDraw);
    socket?.on('draw-declined', () => {
      toast('Opponent rejected your draw offer');
      setPendingDraw(false);
    })
    return () => {
      socket?.off('incoming-draw-offer', handleIncomingDraw);
      socket?.off('draw-declined');
    }
  }, [socket]);

  if (pendingDraw) {
    return (
      <div>
        <small>Accept Draw?</small>
        <Button onClick={acceptDraw} variant='ghost'><Check /></Button>
        <Button onClick={rejectDraw} variant='ghost'><X /></Button>
      </div>
    );
  }

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button disabled={!canDraw} size='lg' className="cursor-pointer border group" variant="ghost"><Handshake className="group-hover:text-amber-400" /></Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Offer Draw</p>
        </TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Peace Treaty?</AlertDialogTitle>
          <AlertDialogDescription>
            Send a draw offer to your opponent? If accepted, the game ends with neither side winning.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={offerDraw}>Offer Draw</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
