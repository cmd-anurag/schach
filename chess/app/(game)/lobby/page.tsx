"use client";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import OnlineUsers from "@/components/OnlineUsers";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";


export default function Lobby() {

  const router = useRouter();

  const {username, isLoggedIn, loading} = useAuth();
  const {socket} = useSocket();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if(loading) return;

    if(!isLoggedIn) {
      router.push('/login');
    }
  }, [router, isLoggedIn, loading]);

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

  

  return (
    <div>
      
      <div>

      <OnlineUsers users={onlineUsers.filter((u) => u !== username)} />
      </div>
    </div>
  )
}
