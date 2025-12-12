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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs"
import { useSocket } from "@/hooks/useSocket";
import { ChallengeColor } from "@/types/socketEvents";
import { Flame, Rabbit, Turtle, Zap } from "lucide-react";
import { useState } from "react"
import { toast } from "sonner"

export default function ChallengeModal({ toUsername }: { toUsername: string }) {
  const [prefColor, setPrefColor] = useState<ChallengeColor>('random');
  const [time, setTime] = useState(-1);
  const [increment, setIncrement] = useState(0);
  const { socket } = useSocket();

  const sendChallenge = () => {
    if(time == -1) {
      toast.error("Time control not specified");
      return;
    }

    socket?.emit('challenge-user', { toUsername, color: prefColor, time, increment});
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
          <div className="flex justify-center">
            <Tabs onValueChange={(value) => setPrefColor(value as ChallengeColor)} defaultValue="random" className="w-[400px] py-3">
              <div className="flex justify-center items-center gap-3">
                <p className="text-sm">Play as?</p>
                <TabsList>
                  <TabsTrigger value="white">White</TabsTrigger>
                  <TabsTrigger value="black">Black</TabsTrigger>
                  <TabsTrigger value="random">Random</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>
          <div className="flex justify-evenly m-3">

            <Select onValueChange={(val) => setTime(Number(val))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Control" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1"><Zap/>1 min</SelectItem>
                <SelectItem value="2"><Zap/>2 min</SelectItem>
                <SelectItem value="3"><Flame/>3 min</SelectItem>
                <SelectItem value="5"><Flame/>5 min</SelectItem>
                <SelectItem value="10"><Rabbit/> 10 min</SelectItem>
                <SelectItem value="15"><Rabbit/> 15 min</SelectItem>
                <SelectItem value="20"><Rabbit/> 20 min</SelectItem>
                <SelectItem value="30"><Turtle /> 30 min</SelectItem>
                <SelectItem value="60"><Turtle /> 60 min</SelectItem>
                <SelectItem value="90"><Turtle /> 90 min</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(val) => setIncrement(Number(val))} defaultValue="0">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Increment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Increment</SelectItem>
                <SelectItem value="1">1 second</SelectItem>
                <SelectItem value="2">2 seconds</SelectItem>
                <SelectItem value="3">3 seconds</SelectItem>
                <SelectItem value="4">4 seconds</SelectItem>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="15">15 seconds</SelectItem>
                <SelectItem value="20">20 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">60 seconds</SelectItem>
                <SelectItem value="90">90 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction onClick={sendChallenge}>Send</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
