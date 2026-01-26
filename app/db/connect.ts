import 'reflect-metadata'
import { DataSource } from "typeorm"
import { User } from "./entities/User"
import { Project } from "./entities/Project"
import { ProjectFile } from "./entities/ProjectFile"
import { Team } from "./entities/Team"
import { TeamMember } from "./entities/TeamMember"
import { TeamInvite } from "./entities/TeamInvite"

const normalizePostgresUrl = (url: string) => {
    try {
        const parsed = new URL(url)
        const sslmode = parsed.searchParams.get("sslmode")
        const hasCompat = parsed.searchParams.has("uselibpqcompat")

        if (sslmode && sslmode !== "verify-full" && !hasCompat) {
            parsed.searchParams.set("uselibpqcompat", "true")
        }

        return parsed.toString()
    } catch {
        return url
    }
}

const stage: 'prod' | 'dev' | undefined | string = process.env.NODE_ENV;

const db = stage !== "prod"
    ? {
        host: process.env.POSTGRES_HOST,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
    }
    : {
        host: process.env.PROD_POSTGRES_HOST,
        username: process.env.PROD_POSTGRES_USER,
        password: process.env.PROD_POSTGRES_PASSWORD,
        database: process.env.PROD_POSTGRES_DATABASE,
    };

// Use connection pooling URL if available, otherwise fall back to individual params
const connectionConfig = process.env.POSTGRES_URL
    ? {
        type: "postgres" as const,
        url: normalizePostgresUrl(process.env.POSTGRES_URL),
    }
    : {
        type: "postgres" as const,
        port: 5432,
        ...db,
    }

const Database = new DataSource({
    ...connectionConfig,
    synchronize: true, // Auto-create tables
    logging: false, // Disable logging in tests
    entities: [User, Project, ProjectFile, Team, TeamMember, TeamInvite],
    migrations: [],
    subscribers: [],
    ssl: {
        rejectUnauthorized: false
    },
    extra: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

export default Database;
