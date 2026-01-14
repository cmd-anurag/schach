"use client";
import IncomingChallenges from "@/components/challenges/IncomingChallenges";
import IsOnline from "@/components/IsOnline";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

export default function Toolbar() {
    const { username } = useAuth();
    return (
        <div className="flex justify-end gap-4 items-center py-4 px-16">
            <IncomingChallenges />
            <IsOnline />
            <User />
            <p className="font-bold">{username}</p>
        </div>
    )
}
