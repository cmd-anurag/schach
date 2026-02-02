
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
    if(minutes > 20)
        return 'CLASSICAL';
    if(minutes > 5)
        return 'RAPID';
    if(minutes > 2)
        return 'BLITZ';
    if(minutes > 0 && minutes <= 2)
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
        await prisma.finishedGames.create({
            data: {
                gameID: body.gameID,
                gameType: getGameType(body.time.baseTime),
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

        return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch(err) {
        return Response.json({message: err}, { status: 500 });    
    }
}