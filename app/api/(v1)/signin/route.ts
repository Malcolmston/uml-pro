import { NextRequest, NextResponse } from "next/server"
import { User } from "@/app/db/entities/User"
import Database from "@/app/db/connect"
import { signJwt } from "@/app/utils/jwt-node"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { identifier, password } = body

        if (!identifier || !password) {
            return NextResponse.json(
                { error: "Identifier and password are required" },
                { status: 400 }
            )
        }

        if (!Database.isInitialized) {
            await Database.initialize()
        }

        const userRepo = Database.getRepository(User)
        const user = await userRepo.findOne({
            withDeleted: true,
            where: [{ email: identifier }, { username: identifier }],
        })

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }

        if(user.deletedAt) return NextResponse.json({ error: "User is deleted" }, { status: 401})

        if( !(await User.comparePassword(password, user.password)) ) return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
        )


        if (user.id === null) {
            return NextResponse.json(
                { error: "User ID missing" },
                { status: 500 }
            )
        }

        const token = signJwt(
            { sub: String(user.id), email: user.email, username: user.username },
            { expiresIn: "7d" }
        )
        if (!token) {
            return NextResponse.json(
                { error: "JWT secret not configured" },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Signin error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
