import { createClient } from "redis"
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"
import Database from "@/app/db/connect"

const redisUrl = process.env.REDIS_URL
const s3Endpoint = process.env.S3_ENDPOINT
const s3AccessKeyId = process.env.AWS_ACCESS_KEY_ID
const s3SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const s3Region = process.env.AWS_REGION || "us-east-1"
const useS3 = process.env.USE_S3 === "true"

export type ServiceStatus = {
    ok: boolean
    configured: boolean
    error?: string
}

export type StatusSnapshot = {
    db: ServiceStatus
    redis: ServiceStatus
    s3: ServiceStatus
    ok: boolean
    timestamp: string
}

export const getStatusSnapshot = async (): Promise<StatusSnapshot> => {
    const dbStatus: ServiceStatus = { ok: false, configured: true }
    const redisStatus: ServiceStatus = { ok: false, configured: !!redisUrl }
    const s3Status: ServiceStatus = {
        ok: false,
        configured: useS3 && !!(s3Endpoint && s3AccessKeyId && s3SecretAccessKey),
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
            redisStatus.error = error instanceof Error ? error.message : String(error)
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
            s3Status.error = error instanceof Error ? error.message : String(error)
        }
    }

    return {
        db: dbStatus,
        redis: redisStatus,
        s3: s3Status,
        ok: dbStatus.ok && redisStatus.ok && s3Status.ok,
        timestamp: new Date().toISOString(),
    }
}

export const getStatusResponse = async () => {
    const snapshot = await getStatusSnapshot()
    const status = snapshot.ok ? 200 : 503
    return { status, body: snapshot }
}
