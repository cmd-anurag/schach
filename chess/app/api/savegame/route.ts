// TODO - VIEW ROUTE FOR FINISHED GAMES
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
    increment: z.number().int(),
  }),
  
  startedAt: z.number(),
  endedAt: z.number(),
});
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
                whiteID: body.whiteID,
                blackID: body.blackID,
                result: body.result,
                reason: body.reason,
                moves: body.moves,
                finalFEN: body.finalFEN,
                timeWhite: body.time.white,
                timeBlack: body.time.black,
                increment: body.time.increment,
                startedAt: new Date(body.startedAt),
                endedAt: new Date(body.endedAt),
            }
        });

        return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch(err) {
        return Response.json({message: err}, { status: 500 });    
    }
}