"use client";

import { useSocket } from "@/hooks/useSocket";
import { Wifi, WifiOff } from 'lucide-react';

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect } from "react";
import { toast } from "sonner";


export default function IsOnline() {
  const { socket, isConnected } = useSocket();

  const tryReConnection = () => {
    if (isConnected) {
      socket?.disconnect();
      socket?.connect();
    } else {
      socket?.connect();
    }
  }

  useEffect(() => {

    socket?.on('connect_error', (err) => {
      toast(`Unable to Connect. ${err}`);
    });
    return () => {
      socket?.off('connect_error');
    }
  }, [socket]);


  return (

    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{isConnected ? <Wifi /> : <WifiOff />}</Button>
      </PopoverTrigger>
      <PopoverContent align="center">
        <PopoverHeader>
          <PopoverDescription className="flex justify-between items-center">
            {isConnected ? <span className="text-green-400">You are Connected.</span> : <span className="text-red-400">You are not Connected!</span>}
            <Button className="cursor-pointer" onClick={tryReConnection}>Reconnect</Button>
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>

  )
}
