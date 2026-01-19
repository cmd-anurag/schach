"use client";

import { useEffect, useState } from "react"
import OnlineUsers from "@/components/OnlineUsers";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";


export default function Lobby() {


  const {socket} = useSocket();
  const {user} = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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
      <OnlineUsers users={onlineUsers.filter((u) => u !== user?.username)} />
      </div>
    </div>
  )
}
