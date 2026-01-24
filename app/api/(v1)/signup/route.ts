import { NextRequest, NextResponse } from "next/server"
import { User } from "@/app/db/entities/User"
import Database from "@/app/db/connect"
import { signJwt } from "@/app/utils/jwt-node"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { firstName, lastName, email, username, password, cofPassword, age} = body

        if ( Number(age) === null || Number(age) < 13 || !age ) return NextResponse.json(
            { error: "You must be at least 13 years old to sign up" },
            { status: 400 }
        )

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
        newUser.age = age
        await userRepo.save(newUser)

        if (newUser.id === null) {
            return NextResponse.json(
                { error: "User ID missing" },
                { status: 500 }
            )
        }

        const token = signJwt(
            { sub: String(newUser.id), email: newUser.email, username: newUser.username },
            { expiresIn: "1h" }
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
