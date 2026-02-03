import { Skeleton } from "./ui/skeleton";

export function ChessStatsSkeleton() {
  return (
    <div className="w-full bg-white bg-zinc-700 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
        
        <div className="col-span-12 md:col-span-3 p-4 flex flex-col justify-center items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-10 w-16" />
        </div>

        <div className="col-span-12 md:col-span-5 p-4 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-3 px-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-4 w-8 rounded-md" />
              </div>
            ))}
          </div>

          <Skeleton className="h-2 w-full rounded-full mb-3" />

          <div className="flex gap-6 text-xs justify-center">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 p-4 bg-zinc-50/30 dark:bg-zinc-900/30">
          <div className="grid grid-cols-2 gap-3 h-full">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col justify-center px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
