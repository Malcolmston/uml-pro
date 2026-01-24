import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import User from "@/app/db/entities/User"

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

        const user = await User.findOne({
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


        const jwtSecret = process.env.JWT_SECRET
        if (!jwtSecret) {
            return NextResponse.json(
                { error: "JWT secret not configured" },
                { status: 500 }
            )
        }

        const token = jwt.sign(
            { sub: user.id, email: user.email, username: user.username },
            jwtSecret,
            { expiresIn: "7d" }
        )

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
