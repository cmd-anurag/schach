import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const session = req.cookies.get('session');
    if(!session) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        "/lobby/:path*",
        "/play/:path*",
        "/spectate/:path*"
    ]
};
