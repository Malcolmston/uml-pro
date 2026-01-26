import { NextRequest, NextResponse } from "next/server"
import { ILike } from "typeorm"
import Database from "@/app/db/connect"
import { User } from "@/app/db/entities/User"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"

export async function GET(request: NextRequest) {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const query = url.searchParams.get("q")?.trim()
    if (!query) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    if (!Database.isInitialized) {
        await Database.initialize()
    }

    // Escape SQL LIKE metacharacters to prevent wildcard abuse
    const escapedQuery = query.replace(/[\\%_]/g, '\\$&')

    const userRepo = Database.getRepository(User)
    const users = await userRepo.find({
        select: ["id", "firstname", "lastname", "email", "username"],
        where: [
            { email: ILike(`%${escapedQuery}%`) },
            { username: ILike(`%${escapedQuery}%`) },
            { firstname: ILike(`%${escapedQuery}%`) },
            { lastname: ILike(`%${escapedQuery}%`) }
        ],
        take: 10
    })

    return NextResponse.json({ users }, { status: 200 })
}
