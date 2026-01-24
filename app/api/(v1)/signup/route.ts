import { NextRequest, NextResponse } from "next/server"
import { User } from "@/app/db/entities/User"
import Database from "@/app/db/connect"
import { signJwt } from "@/app/utils/jwt-node"
import { sendWelcomeEmail } from "@/app/utils/email"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { firstName, lastName, email, username, password, cofPassword, age } =
            body

        const normalizedAge = Number(age)
        if (!Number.isFinite(normalizedAge) || normalizedAge < 13) {
            return NextResponse.json(
                { error: "You must be at least 13 years old to sign up" },
                { status: 400 }
            )
        }

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
        newUser.age = normalizedAge
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

        try {
            await sendWelcomeEmail(newUser.email, newUser.firstname)
        } catch (error) {
            console.error("Welcome email error:", error)
            await userRepo.delete(newUser.id)
            return NextResponse.json(
                { error: "Failed to send welcome email" },
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
