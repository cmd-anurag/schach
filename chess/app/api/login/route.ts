import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {prisma} from "@/lib/prisma";

export async function POST(req: Request){
    try {
        const {username, password} = await req.json();
        if(!username || !password) {
            return NextResponse.json(
                {success: false, message: 'Missing username or password'},
                {status: 400},
            )
        }
        if(username.length < 3 || username.length > 15) {
            return NextResponse.json(
                {success: false, message: 'username must be at least 3 characters long and at most 15 characters'},
                {status: 400},
            )
        }

        const existing = await prisma.user.findUnique({
            where: {username},
        });

        if(!existing) {
            return NextResponse.json(
                {success: false, message: 'User does not exist.'},
                {status: 401},
            )
        }
        const isCorrect = await bcrypt.compare(password, existing.passwordHash);
        if(!isCorrect) {
            return NextResponse.json(
                {success: false, message: 'Invalid Username or Password'},
                {status: 401},
            )
        }
        const token = jwt.sign(
            {id: existing.id, username: existing.username},
            process.env.JWT_SECRET!,
            {expiresIn: "30d"}
        );

        const res = NextResponse.json(
            {success: true, message: 'Logged in'},
            {status: 200},
        );

        res.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        })

        return res; 
    } catch(error) {
        console.log(error);
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500},
        )
    }
}