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

import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs"
import { useSocket } from "@/hooks/useSocket";
import { useState } from "react"
import { toast } from "sonner"

export default function ChallengeModal({ toUsername }: { toUsername: string }) {
  const [prefColor, setPrefColor] = useState('random');
  const {socket} = useSocket();

  const sendChallenge = () => {
    socket?.emit('challenge-user', {toUsername, color: prefColor});
    console.log(`Successfully sent challenge to ${toUsername} color = ${prefColor}`);
    toast.success('Sent :) Prepare for psychological warfare.');
  }
  
  return (
    <AlertDialog>
      <AlertDialogTrigger className="text-sm px-2 py-2 bg-indigo-600 rounded-lg cursor-pointer">Challenge</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Challenge {toUsername}...</AlertDialogTitle>
          <AlertDialogDescription>
            The board awaits. Thirty-two pieces. Two minds. One victor. Shall we begin?
          </AlertDialogDescription>
          <Tabs onValueChange={(value) => setPrefColor(value)} defaultValue="random" className="w-[400px] py-3">
            <div className="flex items-center gap-3">
              <p className="text-sm">Play as?</p>
              <TabsList>
                <TabsTrigger value="white">White</TabsTrigger>
                <TabsTrigger value="black">Black</TabsTrigger>
                <TabsTrigger value="random">Random</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction onClick={sendChallenge}>Send</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
