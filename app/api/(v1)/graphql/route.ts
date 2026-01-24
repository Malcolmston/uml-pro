import { NextRequest, NextResponse } from "next/server"
import { buildSchema, graphql } from "graphql"
import fs from "node:fs"
import path from "node:path"
import { createClient } from "redis"
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"
import Database from "@/app/db/connect"
import { User } from "@/app/db/entities/User"
const schemaSDL = fs.readFileSync(
    path.join(process.cwd(), "app/api/(v1)/graphql/schema.graphql"),
    "utf8"
)
const schema = buildSchema(schemaSDL)

const redisUrl = process.env.REDIS_URL
const s3Endpoint = process.env.S3_ENDPOINT
const s3AccessKeyId = process.env.AWS_ACCESS_KEY_ID
const s3SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const s3Region = process.env.AWS_REGION || "us-east-1"
const useS3 = process.env.USE_S3 === "true"

type ServiceStatus = {
    ok: boolean
    configured: boolean
    error?: string
}

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
    status: async () => {
        const dbStatus: ServiceStatus = { ok: false, configured: true }
        const redisStatus: ServiceStatus = {
            ok: false,
            configured: !!redisUrl,
        }
        const s3Status: ServiceStatus = {
            ok: false,
            configured:
                useS3 && !!(s3Endpoint && s3AccessKeyId && s3SecretAccessKey),
        }

        try {
            if (!Database.isInitialized) {
                await Database.initialize()
            }

            await Database.query("SELECT 1")
            dbStatus.ok = true
        } catch (error) {
            dbStatus.error = error instanceof Error ? error.message : String(error)
        }

        if (!redisUrl) {
            redisStatus.ok = true
        }

        if (redisUrl) {
            const redis = createClient({ url: redisUrl })

            try {
                await redis.connect()
                const result = await redis.ping()
                redisStatus.ok = result === "PONG"
                if (!redisStatus.ok) {
                    redisStatus.error = `Unexpected PING response: ${result}`
                }
            } catch (error) {
                redisStatus.error =
                    error instanceof Error ? error.message : String(error)
            } finally {
                try {
                    await redis.quit()
                } catch {
                    await redis.disconnect()
                }
            }
        }

        if (!s3Status.configured) {
            s3Status.ok = true
        } else {
            const s3Client = new S3Client({
                region: s3Region,
                endpoint: s3Endpoint,
                credentials: {
                    accessKeyId: s3AccessKeyId as string,
                    secretAccessKey: s3SecretAccessKey as string,
                },
                forcePathStyle: true,
            })

            try {
                await s3Client.send(new ListBucketsCommand({}))
                s3Status.ok = true
            } catch (error) {
                s3Status.error =
                    error instanceof Error ? error.message : String(error)
            }
        }

        return {
            db: dbStatus,
            redis: redisStatus,
            s3: s3Status,
            ok: dbStatus.ok && redisStatus.ok && s3Status.ok,
            timestamp: new Date().toISOString(),
        }
    },
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
