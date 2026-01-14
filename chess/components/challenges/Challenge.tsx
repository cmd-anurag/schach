import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/hooks/useSocket"
import { ChallengeColor } from "@/types/socketEvents";

type Props = {
  challengeDetails: {
    fromUsername: string,
    color: ChallengeColor,
    time: number,
    increment: number,
  },
  remove: () => void,
}

export default function Challenge({challengeDetails, remove} : Props) {
  const {fromUsername, color, time, increment} = challengeDetails;
  const {socket} = useSocket();

  const challengeRejectHandler = () => {
    socket?.emit('reject-challenge', {fromUsername})
    remove();
  }

  const challengeAcceptHandler = () => {
    socket?.emit('accept-challenge', {fromUsername, color, time, increment});
    remove();
  }

  return (
    <div className="p-3 m-3 rounded-lg border flex gap-3 items-center justify-between">
        <span>{fromUsername} | {time} + {increment}</span>
        <div>
            <Button onClick={challengeAcceptHandler} className="mr-2 px-2 py-1 cursor-pointer" variant='default'><Check /></Button>
            <Button onClick={challengeRejectHandler} className="cursor-pointer" variant='destructive'><X /></Button>
        </div>
    </div>
  )
}
