import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: "Missing username or password" },
                { status: 400 },
            );
        }

        if (username.length < 3 || username.length > 15) {
            return NextResponse.json(
                { success: false, message: 'username must be at least 3 characters long and at most 15 characters' },
                { status: 400 },
            )
        }

        const existing = await prisma.user.findUnique({
            where: { username }
        });

        if (existing) {
            return NextResponse.json(
                { success: false, message: "username already exists" },
                { status: 400 },
            )
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                passwordHash: hash,
            }
        });

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: "30d" }
        );

        const res = NextResponse.json(
            { success: true, message: "Registered successfully" },
            { status: 201 }
        );

        res.cookies.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });

        return res;

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 },
        )
    }
}