"use client";
import IncomingChallenges from "@/components/challenges/IncomingChallenges";
import IsOnline from "@/components/IsOnline";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

export default function Toolbar() {
    const { user } = useAuth();
    return (
        <div className="flex justify-end gap-2 md:gap-4 items-center py-2 md:py-4 px-4 md:px-16">
            <IncomingChallenges />
            <IsOnline />
            <User className="w-4 h-4 md:w-6 md:h-6" />
            <p className="font-bold text-sm md:text-base">{user?.username}</p>
        </div>
    )
}
