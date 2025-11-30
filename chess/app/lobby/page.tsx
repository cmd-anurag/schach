"use client";

import { getSocket } from "@/lib/socket"
import { getToken, getUsername } from "@/lib/auth";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import OnlineUsers from "@/components/OnlineUsers";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socketEvents";

export default function Lobby() {

  const router = useRouter();

  const [userName, setUsername] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  useEffect(() => {
    
    if(!getToken()) {
      router.push('/login');
      return;
    }

    socket = getSocket();
    const username = getUsername();
    setUsername(username);

    // TODO
    // event listeners on socket
    const onlineUsersHandler = ({users} : {users: string[]}) => {
      console.log("online users were receiveed");
      setOnlineUsers(users);
    }
    socket?.emit('get-online-users');
    socket?.on('online-users', onlineUsersHandler)
    return () => {
      socket?.off("online-users", onlineUsersHandler);
    }

  }, []);

  return (
    <div>
      <p className="font-bold">You are {userName}</p>
      <OnlineUsers users={onlineUsers.filter((u) => u !== userName)} />
    </div>
  )
}
