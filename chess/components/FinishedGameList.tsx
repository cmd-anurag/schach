import {prisma} from "@/lib/prisma";
import { ComponentProps } from "react";
import FinishedGame from "./FinishedGame";
import Link from "next/link";

const GameTypeMap = {
  BULLET: 'bullet',
  BLITZ: 'blitz',
  RAPID: 'rapid',
  CLASSICAL: 'classical',
} as const;

type GameDetail = ComponentProps<typeof FinishedGame>['gameDetails'];

// todo - unstable cache this
const fetchGamesByUserID = async(userID: number) => {
  const games = await prisma.finishedGames.findMany({
    where: { OR: [{whiteID: userID}, {blackID: userID}] },
    orderBy: [{endedAt: 'desc'}],
    take: 30,
    select: {
      gameID: true, gameType: true, whiteID: true, blackID: true,
      baseTime: true, increment: true, finalFEN: true, reason: true,
      result: true, startedAt: true, endedAt: true,
      white: {select: {username: true}},
      black: {select: {username: true}},
    }
  });
  return games;
}


export default async function FinishedGameList({userID} : {userID: number}) {

    const games = await fetchGamesByUserID(userID);

  return (
    <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            Recent Games
            <span className="text-xs font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Last 30</span>
          </h2>
          
          <div className="flex flex-col gap-4">
            {games.map((game) => {
              const gameDetails: GameDetail = {
                baseTime: game.baseTime,
                increment: game.increment,
                type: GameTypeMap[game.gameType],
                finalPosition: game.finalFEN,
                whiteUsername: game.white.username,
                blackUsername: game.black.username,
                winner: game.result === 'DRAW' ? 'draw' : game.result === 'WHITE'? 'white' : 'black',
                reason: game.reason,
                startedAt: game.startedAt.getTime(),
                endedAt: game.endedAt.getTime(),
              }
              return (
                <Link key={game.gameID} href={`/game/${game.gameID}`} className="block transition-transform hover:scale-[1.01]">
                    <FinishedGame gameDetails={gameDetails} />
                </Link>
              )
            })}
          </div>
        </div>
  )
}
