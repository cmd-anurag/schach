import ViewGameClient from "@/components/ViewGameClient";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

const fetchGameByID = unstable_cache(async (gameID: string) => {
  const game = await prisma.finishedGames.findUnique({
    where: { gameID },
    include: {
      white: {
        select: {
          id: true,
          username: true,
        }
      },
      black: {
        select: {
          id: true,
          username: true,
        }
      }
    }
  });
  return game;
}, ['fetch-game-by-id']);

export default async function ViewGame({ params }: {
  params: Promise<{ gameID: string }>
}) {

  const gameID = (await params).gameID;
  const game = await fetchGameByID(gameID);
  if (!game) {
    notFound();
  }

  const playersInfo = {
    whiteUsername: game.white.username,
    blackUsername: game.black.username,
    whiteTime: game.timeWhite,
    blackTime: game.timeBlack,
  }

  const boardState = {
    moveHistory: game.moves,
    cursor: game.moves.length,
    color: null,
    turn: 'white',
    isInteractive: false,
  }

  const controls = {
    canDraw: false,
    canResign: false,
  }

  return (
    <ViewGameClient
      playersInfo={playersInfo}
      boardState={{ ...boardState, turn: 'white' }} 
      controls={controls} 
      gameID={gameID} />
  )
}
