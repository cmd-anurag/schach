import ChessStats from "@/components/ChessStats";
import { ChessStatsSkeleton } from "@/components/ChessStatsSkeleton";
import FinishedGameList from "@/components/FinishedGameList";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const fetchUserIDByUsername = async(username: string) => {
  const userID = await prisma.user.findUnique({
    where: {username},
    select: {id: true},
  });
  return userID?.id;
}

export default async function User({params} : {params: Promise<{username: string}>}) {
    const username = (await params).username;
    const userID = await fetchUserIDByUsername(username);
    
    if(!userID) {
      notFound();
    }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
        
        {/* username + avatar */}
        <div className="flex items-center gap-5 mb-8">
           <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg flex items-center justify-center text-3xl font-bold text-white uppercase border-4 border-white dark:border-zinc-900">
              {username.charAt(0)}
           </div>
           <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {username}
              </h1>
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                Future Grandmaster
              </span>
           </div>
        </div>

        {/* STATS */}
        <Suspense fallback={<ChessStatsSkeleton />}>
          <ChessStats userID={userID} />
        </Suspense>

        {/* GAMES LIST */}
        <Suspense fallback={<Skeleton className="w-full h-32 bg-zinc-700" />}>
          <FinishedGameList userID={userID} />
        </Suspense>
        
        
    </div>
  )
}