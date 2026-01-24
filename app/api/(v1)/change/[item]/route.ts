import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { User } from "@/app/db/entities/User"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import {
    sendEmailChangedEmail,
    sendPasswordChangedEmail,
    sendUsernameChangedEmail,
} from "@/app/utils/email"

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

            const previousEmail = user.email
            const previousUsername = user.username

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

            if (item === "email") {
                try {
                    await sendEmailChangedEmail({
                        email: user.email,
                        oldEmail: previousEmail,
                    })
                } catch (error) {
                    console.error("Email change notification error:", error)
                    user.email = previousEmail
                    await userRepo.save(user)
                    return NextResponse.json(
                        { error: "Failed to send email change notice" },
                        { status: 500 }
                    )
                }
            }

            if (item === "username") {
                try {
                    await sendUsernameChangedEmail({
                        email: user.email,
                        username: user.username,
                    })
                } catch (error) {
                    console.error("Username change notification error:", error)
                    user.username = previousUsername
                    await userRepo.save(user)
                    return NextResponse.json(
                        { error: "Failed to send username change notice" },
                        { status: 500 }
                    )
                }
            }
        }

        await userRepo.save(user)

        if (item === "password") {
            try {
                await sendPasswordChangedEmail(user.email)
            } catch (error) {
                console.error("Password change notification error:", error)
                user.password = user.originalPassword ?? user.password
                await userRepo.save(user)
                return NextResponse.json(
                    { error: "Failed to send password change notice" },
                    { status: 500 }
                )
            }
        }

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
