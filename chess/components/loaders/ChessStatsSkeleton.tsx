
const ChessStatsSkeleton = () => {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">

        <div className="col-span-12 md:col-span-3 p-4 flex flex-col justify-center items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
          <div className="h-9 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>

        <div className="col-span-12 md:col-span-5 p-4 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-4 px-4">
            <div className="flex flex-col items-center gap-1">
              <div className="h-2 w-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 w-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-2 w-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 w-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-2 w-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 w-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
          </div>

          <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 mb-4"></div>

          <div className="flex gap-6 justify-center">
            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 p-4 bg-zinc-50/30 dark:bg-zinc-900/30">
          <div className="grid grid-cols-2 gap-3 h-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col justify-center px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 shadow-sm h-[60px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                  <div className="h-2.5 w-12 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                </div>
                <div className="h-5 w-8 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChessStatsSkeleton;