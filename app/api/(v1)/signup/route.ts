import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { User } from "@/app/db/entities/User"
import Database from "@/app/db/connect"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { firstName, lastName, email, username, password, cofPassword } = body

        if (!firstName || !lastName || !email || !username || !password || !cofPassword) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        if (password !== cofPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            )
        }

        if (!Database.isInitialized) {
            await Database.initialize()
        }

        const userRepo = Database.getRepository(User)
        const existingUser = await userRepo.findOne({
            withDeleted: true,
            where: [{ email }, { username }],
        })

        if (existingUser?.deletedAt) {
            return NextResponse.json(
                { error: "User was deleted", time: existingUser.deletedAt },
                { status: 400 }
            )
        }

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists, please signin" },
                { status: 400 }
            )
        }

        const newUser = new User()
        newUser.firstname = firstName
        newUser.lastname = lastName
        newUser.email = email
        newUser.username = username
        newUser.password = password
        await userRepo.save(newUser)

        const jwtSecret = process.env.JWT_SECRET ?? process.env.SUPABASE_JWT_SECRET
        if (!jwtSecret) {
            return NextResponse.json(
                { error: "JWT secret not configured" },
                { status: 500 }
            )
        }

        const token = jwt.sign(
            { sub: newUser.id, email: newUser.email, username: newUser.username },
            jwtSecret,
            { expiresIn: "1h" }
        )

        return NextResponse.json(
            {
                success: true,
                token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username
                }
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Signup error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
