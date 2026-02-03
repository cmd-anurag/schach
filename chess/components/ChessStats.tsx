import { Zap, Timer, Hourglass, Shield } from 'lucide-react';
import {prisma} from "@/lib/prisma";

// todo - unstable cache this
async function fetchUserStats(userID: number) {
  const stats = await prisma.userStats.findUnique({ where: { userID } });
  return stats ?? {
    totalGames: 0, gamesWhite: 0, gamesBlack: 0,
    wins: 0, losses: 0, draws: 0,
    bullet: 0, blitz: 0, rapid: 0, classical: 0,
  };
}


export default async function ChessStats({ userID }: {userID: number}) {

    const stats = await fetchUserStats(userID);

    const total = stats.totalGames || 1; 
    const winPct = Math.round((stats.wins / total) * 100);
    const lossPct = Math.round((stats.losses / total) * 100);
    const drawPct = 100 - winPct - lossPct;

    return (
        <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
                
                {/* TOTAL GAMES */}
                <div className="col-span-12 md:col-span-3 p-4 flex flex-col justify-center items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        Total Games
                    </div>
                    <div className="text-4xl font-black text-zinc-800 dark:text-zinc-100 leading-none">
                        {stats.totalGames}
                    </div>
                </div>

                <div className="col-span-12 md:col-span-5 p-4 flex flex-col justify-center">
                    {/* W/L/D */}
                    <div className="flex justify-between items-end mb-3 px-4">
                        <div className="text-center">
                            <span className="text-xs text-zinc-400 block mb-1 font-medium uppercase tracking-wider">Wins</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xl block">{stats.wins}</span>
                            <span className="text-[10px] text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">{winPct}%</span>
                        </div>
                        <div className="text-center">
                            <span className="text-xs text-zinc-400 block mb-1 font-medium uppercase tracking-wider">Draws</span>
                            <span className="font-bold text-zinc-500 dark:text-zinc-400 text-xl block">{stats.draws}</span>
                            <span className="text-[10px] text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">{drawPct}%</span>
                        </div>
                        <div className="text-center">
                            <span className="text-xs text-zinc-400 block mb-1 font-medium uppercase tracking-wider">Losses</span>
                            <span className="font-bold text-red-500 dark:text-red-400 text-xl block">{stats.losses}</span>
                            <span className="text-[10px] text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">{lossPct}%</span>
                        </div>
                    </div>
                    
                    {/*bar */}
                    <div className="h-2 w-full rounded-full overflow-hidden flex bg-zinc-100 dark:bg-zinc-800 mb-3">
                        <div style={{ width: `${winPct}%` }} className="bg-emerald-500" />
                        <div style={{ width: `${drawPct}%` }} className="bg-zinc-300 dark:bg-zinc-600" />
                        <div style={{ width: `${lossPct}%` }} className="bg-red-500" />
                    </div>

                    {/* stats*/}
                    <div className="flex gap-6 text-xs justify-center opacity-80">
                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                            <div className="w-2 h-2 rounded-full bg-white border border-zinc-400"></div>
                            <span className="font-medium">White: {stats.gamesWhite}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                            <div className="w-2 h-2 rounded-full bg-black border border-zinc-700"></div>
                            <span className="font-medium">Black: {stats.gamesBlack}</span>
                        </div>
                    </div>
                </div>

                {/* game types */}
                <div className="col-span-12 md:col-span-4 p-4 bg-zinc-50/30 dark:bg-zinc-900/30">
                    <div className="grid grid-cols-2 gap-3 h-full">
                        <MiniStat label="Bullet" value={stats.bullet} icon={<Zap className="w-3.5 h-3.5 text-orange-500" />} />
                        <MiniStat label="Blitz" value={stats.blitz} icon={<Timer className="w-3.5 h-3.5 text-yellow-500" />} />
                        <MiniStat label="Rapid" value={stats.rapid} icon={<Hourglass className="w-3.5 h-3.5 text-blue-500" />} />
                        <MiniStat label="Classic" value={stats.classical} icon={<Shield className="w-3.5 h-3.5 text-purple-500" />} />
                    </div>
                </div>

            </div>
        </div>
    );
};

const MiniStat = ({ label, value, icon }: {label: string, value: number, icon: React.ReactNode}) => (
    <div className="flex flex-col justify-center px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
            {icon}
            <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">{label}</span>
        </div>
        <span className="text-lg font-bold text-zinc-700 dark:text-zinc-200">{value}</span>
    </div>
);

