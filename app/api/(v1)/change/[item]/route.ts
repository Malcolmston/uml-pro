import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { User } from "@/app/db/entities/User"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ item: string }> }
) {
    const { item } = await context.params
    if (!["firstname", "lastname", "email", "username", "password"].includes(item)) {
        return NextResponse.json({ error: "Unsupported field" }, { status: 400 })
    }

    const userId = getUserIdFromRequest(request)
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()

        if (!Database.isInitialized) {
            await Database.initialize()
        }

        const userRepo = Database.getRepository(User)
        const user = await userRepo.findOne({ where: { id: userId } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        user.originalPassword = user.password

        if (item === "password") {
            const { currentPassword, newPassword } = body
            if (!currentPassword || !newPassword) {
                return NextResponse.json(
                    { error: "Current and new password are required" },
                    { status: 400 }
                )
            }

            const isValid = await User.comparePassword(
                currentPassword,
                user.password
            )
            if (!isValid) {
                return NextResponse.json(
                    { error: "Invalid credentials" },
                    { status: 401 }
                )
            }

            user.password = newPassword
        } else {
            const value = body?.value
            if (!value || typeof value !== "string") {
                return NextResponse.json(
                    { error: "Value is required" },
                    { status: 400 }
                )
            }

            if (item === "email") {
                const existing = await userRepo.findOne({ where: { email: value } })
                if (existing && existing.id !== user.id) {
                    return NextResponse.json(
                        { error: "Email already in use" },
                        { status: 409 }
                    )
                }
                user.email = value
            }

            if (item === "username") {
                const existing = await userRepo.findOne({
                    where: { username: value },
                })
                if (existing && existing.id !== user.id) {
                    return NextResponse.json(
                        { error: "Username already in use" },
                        { status: 409 }
                    )
                }
                user.username = value
            }

            if (item === "firstname") {
                user.firstname = value
            }

            if (item === "lastname") {
                user.lastname = value
            }
        }

        await userRepo.save(user)

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Change error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
