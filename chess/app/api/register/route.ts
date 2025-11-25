import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import {prisma} from "@/lib/prisma";

export async function POST(req: Request)
{
    try {
        const {username, password} = await req.json();
        if(!username || !password) {
            return NextResponse.json(
                {success: false, message: "Missing username or password"},
                {status: 400},
            );
        }

        if(username.length < 3 || username.length > 15) {
            return NextResponse.json(
                {success: false, message: 'username must be at least 3 characters long and at most 15 characters'},
                {status: 400},
            )
        }

        const existing = await prisma.user.findUnique({
            where: {username}
        });

        if(existing) {
            return NextResponse.json(
                {success: false, message: "username already exists"},
                {status: 400},
            )
        }

        const hash = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                username,
                passwordHash: hash,
            }
        });

        return NextResponse.json(
            {success: true, message: "Registered Successfully"},
            {status: 201},
        )
    } catch(error) {
        console.log(error);
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500},
        )
    }
}