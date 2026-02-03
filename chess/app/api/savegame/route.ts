// Future Todo - challenge context 

import {prisma} from "@/lib/prisma";
import { z } from "zod";

const SaveGameSchema = z.object({
  gameID: z.string(),

  whiteID: z.number().int(),
  blackID: z.number().int(),

  result: z.enum(["WHITE", "BLACK", "DRAW"]),
  reason: z.string(),

  moves: z.array(z.string()),
  finalFEN: z.string(),
  time: z.object({
    white: z.number().int(),
    black: z.number().int(),
    baseTime: z.number().int(),
    increment: z.number().int(),
  }),
  
  startedAt: z.number(),
  endedAt: z.number(),
});

const getGameType = (baseTime: number) => {
    const minutes = baseTime / 1000 / 60;
    if(minutes >= 60)
        return 'CLASSICAL';
    if(minutes >= 10)
        return 'RAPID';
    if(minutes >= 3)
        return 'BLITZ';
    if(minutes > 0)
        return 'BULLET';

    return 'CLASSICAL';
}

export async function POST(req: Request){
    
    try {
        const raw =  await req.json();
        const parsed = SaveGameSchema.safeParse(raw);
    
        if(!parsed.success) {
            return Response.json({message: 'parse failed'}, {status: 400});
        }
    
        const body = parsed.data;
        const gameType = getGameType(body.time.baseTime);

        await prisma.$transaction(async (tx) => {
            await tx.finishedGames.create({
                data: {
                    gameID: body.gameID,
                    gameType: gameType,
                    whiteID: body.whiteID,
                    blackID: body.blackID,
                    result: body.result,
                    reason: body.reason,
                    moves: body.moves,
                    finalFEN: body.finalFEN,
                    timeWhite: body.time.white,
                    timeBlack: body.time.black,
                    increment: body.time.increment,
                    baseTime: body.time.baseTime,
                    startedAt: new Date(body.startedAt),
                    endedAt: new Date(body.endedAt),
                }
            });

            // update white
            await tx.userStats.upsert({
                where: { userID: body.whiteID },
                create: {
                    userID: body.whiteID,
                    totalGames: 1,
                    gamesWhite: 1,
                    wins: body.result === 'WHITE' ? 1 : 0,
                    losses: body.result === 'BLACK' ? 1 : 0,
                    draws: body.result === 'DRAW' ? 1 : 0,
                    [gameType.toLowerCase()]: 1,
                },
                update: {
                    totalGames: { increment: 1 },
                    gamesWhite: { increment: 1 },
                    wins: { increment: body.result === 'WHITE' ? 1 : 0 },
                    losses: { increment: body.result === 'BLACK' ? 1 : 0 },
                    draws: { increment: body.result === 'DRAW' ? 1 : 0 },
                    [gameType.toLowerCase()]: { increment: 1 },
                },
            });

            // update black stats
            await tx.userStats.upsert({
                where: { userID: body.blackID },
                create: {
                    userID: body.blackID,
                    totalGames: 1,
                    gamesBlack: 1,
                    wins: body.result === 'BLACK' ? 1 : 0,
                    losses: body.result === 'WHITE' ? 1 : 0,
                    draws: body.result === 'DRAW' ? 1 : 0,
                    [gameType.toLowerCase()]: 1,
                },
                update: {
                    totalGames: { increment: 1 },
                    gamesBlack: { increment: 1 },
                    wins: { increment: body.result === 'BLACK' ? 1 : 0 },
                    losses: { increment: body.result === 'WHITE' ? 1 : 0 },
                    draws: { increment: body.result === 'DRAW' ? 1 : 0 },
                    [gameType.toLowerCase()]: { increment: 1 },
                },
            });
        });

        return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch(err) {
        return Response.json({message: err}, { status: 500 });    
    }
}