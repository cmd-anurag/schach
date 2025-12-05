import { useSocket } from "@/hooks/useSocket";
import { Wifi, WifiOff } from 'lucide-react';

export default function IsOnline() {
    const {isConnected} = useSocket();

  return (
    <div>{isConnected? <Wifi /> : <WifiOff />}</div>
  )
}
