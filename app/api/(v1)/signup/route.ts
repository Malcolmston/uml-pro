import { NextRequest, NextResponse } from "next/server"
import { User } from "@/app/db/entities/User"
import Database from "@/app/db/connect"
import { signJwt } from "@/app/utils/jwt-node"
import { sendWelcomeEmail } from "@/app/utils/email"
import { Team } from "@/app/db/entities/Team"
import { TeamMember } from "@/app/db/entities/TeamMember"
import TeamRole from "@/app/db/teamRole"

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

        let result
        try {
            result = await Database.manager.transaction(async (entityManager) => {
                const newUser = new User()
                newUser.firstname = firstName
                newUser.lastname = lastName
                newUser.email = email
                newUser.username = username
                newUser.password = password
                newUser.age = normalizedAge
                
                await entityManager.save(newUser)

                if (newUser.id === null) {
                    throw new Error("User ID missing")
                }

                const team = new Team()
                team.name = `${firstName}${lastName}-team`
                await entityManager.save(team)

                const member = new TeamMember()
                member.teamId = team.id
                member.userId = newUser.id
                member.role = TeamRole.ADMIN
                await entityManager.save(member)

                const token = signJwt(
                    { sub: String(newUser.id), email: newUser.email, username: newUser.username },
                    { expiresIn: "1h" }
                )

                if (!token) {
                    throw new Error("JWT secret not configured")
                }

                return { newUser, token }
            })
        } catch (error: unknown) {
            console.error("Signup transaction error:", error)
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            )
        }

        const { newUser, token } = result

        try {
            await sendWelcomeEmail(newUser.email, newUser.firstname)
        } catch (error) {
            console.error("Welcome email error:", error)
            // Log error but don't fail the signup
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
