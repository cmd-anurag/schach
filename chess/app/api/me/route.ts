import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = (await cookies()).get('session');
    if(!session) {
        return new Response(null, {status: 401});
    }

    try {
        const payload = jwt.verify(
            session.value,
            process.env.JWT_SECRET!,
        ) as {id: number, username: string};

        const user = await prisma.user.findUnique({
            where : {id: payload.id},
            select: {
                id: true,
                username: true,
            }
        });

        if(!user) {
            return new Response(null, {status: 401});
        }

        return Response.json(user);
    } catch {
        return new Response(null, {status: 401});
    }
}