import { NextRequest, NextResponse } from "next/server"
import { buildSchema, graphql } from "graphql"
import fs from "node:fs"
import path from "node:path"
import Database from "@/app/db/connect"
import { User } from "@/app/db/entities/User"
import { signJwt } from "@/app/utils/jwt-node"
import { getStatusSnapshot } from "@/app/utils/status"

const schemaSDL = fs.readFileSync(
    path.join(process.cwd(), "app/api/(v1)/public/graphql/schema.graphql"),
    "utf8"
)
const schema = buildSchema(schemaSDL)

const root = {
    ping: () => "pong",
    status: async () => getStatusSnapshot(),
    signup: async ({ input }: { input: {
        firstName: string
        lastName: string
        email: string
        username: string
        password: string
        cofPassword: string
        age: number
    } }) => {
        const { firstName, lastName, email, username, password, cofPassword, age } =
            input

        if (!firstName || !lastName || !email || !username || !password || !cofPassword) {
            throw new Error("Missing required fields")
        }

        if (password !== cofPassword) {
            throw new Error("Passwords do not match")
        }

        const normalizedAge = Number(age)
        if (!Number.isFinite(normalizedAge) || normalizedAge < 13) {
            throw new Error("You must be at least 13 years old to sign up")
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
            throw new Error("User was deleted")
        }

        if (existingUser) {
            throw new Error("User already exists, please signin")
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
            throw new Error("User ID missing")
        }

        const token = signJwt(
            { sub: String(newUser.id), email: newUser.email, username: newUser.username },
            { expiresIn: "1h" }
        )
        if (!token) {
            throw new Error("JWT secret not configured")
        }

        return {
            success: true,
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
            },
        }
    },
}

export async function POST(request: NextRequest) {
    try {
        const { query, variables, operationName } = await request.json()

        if (!query) {
            return NextResponse.json(
                { errors: [{ message: "Missing GraphQL query" }] },
                { status: 400 }
            )
        }

        const result = await graphql({
            schema,
            source: query,
            rootValue: root,
            variableValues: variables,
            operationName,
        })

        return NextResponse.json(result, { status: result.errors ? 400 : 200 })
    } catch (error) {
        console.error("GraphQL error:", error)
        return NextResponse.json(
            { errors: [{ message: "Internal server error" }] },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json(
        { error: "Use POST for GraphQL requests" },
        { status: 405 }
    )
}
