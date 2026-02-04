import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IncomingChallenge } from "@/context/ChallengeContext";

type Props = {
  challenge: IncomingChallenge,
  acceptIncomingChallenge: (challenge: IncomingChallenge) => void,
  rejectIncomingCHallenge: (challenge: IncomingChallenge) => void;
}

export default function Challenge({challenge, acceptIncomingChallenge, rejectIncomingCHallenge} : Props) {
  const {fromUsername, time, increment} = challenge;

  const challengeRejectHandler = () => {
    rejectIncomingCHallenge(challenge);
  }
  
  const challengeAcceptHandler = () => {
    acceptIncomingChallenge(challenge);
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
