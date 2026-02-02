import FinishedGame from "@/components/FinishedGame";
import {prisma} from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComponentProps } from "react";

const GameTypeMap = {
  BULLET: 'bullet',
  BLITZ: 'blitz',
  RAPID: 'rapid',
  CLASSICAL: 'classical',
} as const;

const fetchUserIDByUsername = async(username: string) => {
  const userID = await prisma.user.findUnique({
    where: {username},
    select: {id: true},
  });
  return userID?.id;
}

const fetchGamesByUserID = async(userID: number) => {
  const games = await prisma.finishedGames.findMany({
    where: {
      OR: [
        {whiteID: userID},
        {blackID: userID},
      ],
    },
    orderBy: [
      {endedAt: 'desc'},
    ],
    take: 30,
    select: {
      gameID: true,
      gameType: true,
      whiteID: true,
      blackID: true,
      baseTime: true,
      increment: true,
      finalFEN: true,
      reason: true,
      result: true,
      startedAt: true,
      endedAt: true,
      white: {select: {username: true}},
      black: {select: {username: true}},
    }
  });

  return games;
}

type GameDetail = ComponentProps<typeof FinishedGame>['gameDetails'];

export default async function User({params} : {params: Promise<{username: string}>}) {
    const username = (await params).username;
    const userID = await fetchUserIDByUsername(username);
    if(!userID) {
      notFound();
    }

    const games = await fetchGamesByUserID(userID);
    const gamesAsWhite = games.filter((game) => game.whiteID === userID);
    const gamesAsBlack = games.filter((game) => game.blackID === userID);

  return (
    <div>
        <h1>{username}</h1>
        <h2>Total Games Played: {games.length}</h2>
        <h3>White: {gamesAsWhite.length}</h3>
        <h3>Black: {gamesAsBlack.length}</h3>
        
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
          return <Link key={game.gameID} href={`/game/${game.gameID}`}><FinishedGame gameDetails={gameDetails} /></Link>
        })}
    </div>
  )
}
