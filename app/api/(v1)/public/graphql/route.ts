import { NextRequest, NextResponse } from "next/server"
import { buildSchema, graphql } from "graphql"
import fs from "node:fs"
import path from "node:path"
import { getStatusSnapshot } from "@/app/utils/status"

const schemaSDL = fs.readFileSync(
    path.join(process.cwd(), "app/api/(v1)/public/graphql/schema.graphql"),
    "utf8"
)
const schema = buildSchema(schemaSDL)

const root = {
    ping: () => "pong",
    status: async () => getStatusSnapshot(),
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
