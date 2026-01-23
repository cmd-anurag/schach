import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = (await cookies()).get("session");
  if (!session) {
    return new Response(null, { status: 401 });
  }

  try {
    // 1. Verify session cookie (primary auth)
    const payload = jwt.verify(
      session.value,
      process.env.JWT_SECRET!
    ) as { id: number; username: string };

    // 2. Load user (authoritative)
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return new Response(null, { status: 401 });
    }

    // 3. Mint WS-only token (capability, not session)
    const wsToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        type: 'ws',
      },
      process.env.WS_JWT_SECRET!, 
      {
        expiresIn: "2h", // choose your balance (1–6h is reasonable)
      }
    );

    // 4. Return both
    return Response.json({
      user,
      wsToken,
    });
  } catch {
    return new Response(null, { status: 401 });
  }
}
