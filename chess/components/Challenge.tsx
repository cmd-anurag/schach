import { Check, X } from "lucide-react"
import { Button } from "./ui/button"
import { useSocket } from "@/hooks/useSocket"
import { ChallengeColor } from "@/types/socketEvents";

export default function Challenge({fromUsername, color, remove} : {fromUsername: string, color: ChallengeColor, remove: () => void}) {
  const {socket} = useSocket();

  const challengeRejectHandler = () => {
    socket?.emit('reject-challenge', {fromUsername})
    remove();
  }

  const challengeAcceptHandler = () => {
    socket?.emit('accept-challenge', {fromUsername, color});
    remove();
  }

  return (
    <div className="p-3 m-3 rounded-lg border flex gap-3 items-center justify-between">
        <span>{fromUsername}</span>
        <div>
            <Button onClick={challengeAcceptHandler} className="mr-2 px-2 py-1 cursor-pointer" variant='default'><Check /></Button>
            <Button onClick={challengeRejectHandler} className="cursor-pointer" variant='destructive'><X /></Button>
        </div>
    </div>
  )
}
