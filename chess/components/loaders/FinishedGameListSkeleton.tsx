import React from 'react';

const FinishedGameListSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
      </div>
      
      {/* Game Cards List */}
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="w-full h-20 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between animate-pulse"
          >
            <div className="flex items-center gap-4 w-full">
                
              <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />

              <div className="flex flex-col justify-center gap-2.5 w-full max-w-[200px]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-2.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-2.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 pl-4 border-l border-zinc-100 dark:border-zinc-800/50">
               <div className="h-5 w-14 bg-zinc-200 dark:bg-zinc-800 rounded" />
               <div className="h-2 w-10 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FinishedGameListSkeleton;