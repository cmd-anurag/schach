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

export function DrawButton({gameID} : {gameID: string}) {
    const {socket} = useSocket();

    const [pendingDraw, setPendingDraw] = useState(false);

    const offerDraw = () => {
        socket?.emit('offer-draw', {gameID});
        toast(`Sent a Draw Offer to opponent`);
    }

    const acceptDraw = () => {
        socket?.emit('accept-draw', {gameID});
        setPendingDraw(false);
    }

    const rejectDraw = () => {
        socket?.emit('reject-draw', {gameID});
        setPendingDraw(false);
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

    if(pendingDraw) {
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
      <AlertDialogTrigger asChild>
        <Button size='lg' className="cursor-pointer border" variant="ghost"><Handshake /></Button>
      </AlertDialogTrigger>
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
