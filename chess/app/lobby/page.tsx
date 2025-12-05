"use client";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import OnlineUsers from "@/components/OnlineUsers";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import IsOnline from "@/components/IsOnline";
import IncomingChallenges from "@/components/IncomingChallenges";


export default function Lobby() {

  const router = useRouter();

  const {token, username, isLoading, logout} = useAuth();
  const {socket} = useSocket();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if(!isLoading && !token) {
      router.push('/login');
    }
  }, [router, token, isLoading]);

  useEffect(() => {
    
    if(!socket) {
      return;
    }

    // event listeners on socket
    const onlineUsersHandler = ({users} : {users: string[]}) => {
      console.log("online users were receiveed");
      setOnlineUsers(users);
    }
    socket?.emit('get-online-users');
    socket?.on('online-users', onlineUsersHandler);

    return () => {
      socket?.off("online-users", onlineUsersHandler);
    }

  }, [socket]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  return (
    <div>
      <div className="flex justify-end gap-2 items-center">
        <IsOnline />
        <p className="font-bold">{username}</p>
        <button onClick={handleLogout} className="bg-red-500 text-white px-2 py-1 cursor-pointer rounded-lg">Logout</button>
      </div>
      <IncomingChallenges />
      <OnlineUsers users={onlineUsers.filter((u) => u !== username)} />
    </div>
  )
}
