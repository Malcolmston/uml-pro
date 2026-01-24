import { NextRequest, NextResponse } from "next/server"
import { buildSchema, graphql } from "graphql"
import fs from "node:fs"
import path from "node:path"
import Database from "@/app/db/connect"
import { User } from "@/app/db/entities/User"
const schemaSDL = fs.readFileSync(
    path.join(process.cwd(), "app/api/(v1)/graphql/schema.graphql"),
    "utf8"
)
const schema = buildSchema(schemaSDL)

const toUserDTO = (user: User) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    firstname: user.firstname,
    lastname: user.lastname,
    age: user.age,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
})

const getUserRepo = async () => {
    if (!Database.isInitialized) {
        await Database.initialize()
    }
    return Database.getRepository(User)
}

const root = {
    ping: () => "pong",
    users: async () => {
        const repo = await getUserRepo()
        const users = await repo.find()
        return users.map(toUserDTO)
    },
    user: async ({ id }: { id: string }) => {
        const repo = await getUserRepo()
        const user = await repo.findOne({ where: { id: Number(id) } })
        return user ? toUserDTO(user) : null
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
