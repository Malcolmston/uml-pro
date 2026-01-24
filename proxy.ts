import { NextRequest, NextResponse } from "next/server"
import { getBearerToken } from "@/app/utils/jwt"
import { isJwtValidEdge } from "@/app/utils/jwt-edge"

export async function proxy(request: NextRequest) {
    if (request.method === "OPTIONS") {
        return NextResponse.next()
    }

    const pathname = request.nextUrl.pathname
    const publicPaths = [
        "/api/(v1)/signin",
        "/api/(v1)/signup",
        "/api/(v1)/status",
        "/api/(v1)/(public)/graphql",
    ]
    if (publicPaths.includes(pathname)) {
        return NextResponse.next()
    }

    const token = getBearerToken(request)
    if (!token || !(await isJwtValidEdge(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/api/(public)/graphql/:path*", "/api/(v1)/:path*"],
}
