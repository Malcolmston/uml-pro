import { NextResponse } from "next/server"
import { createClient } from "redis"
import Database from "../db/connect"
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"

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

const okResponse = (db: ServiceStatus, redis: ServiceStatus, s3: ServiceStatus) => {
  const allOk = db.ok && redis.ok && s3.ok
  const anyFailed = !db.ok || !redis.ok || !s3.ok
  const status = anyFailed ? 503 : 200

  return NextResponse.json(
    {
      db,
      redis,
      s3,
      ok: allOk,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

export async function GET() {
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

  return okResponse(dbStatus, redisStatus, s3Status)
}
