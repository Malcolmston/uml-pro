import { DataSource } from "typeorm"
import { User } from "./entities/User"
import { Project } from "./entities/Project"
import { ProjectFile } from "./entities/ProjectFile"
import { Team } from "./entities/Team"
import { TeamMember } from "./entities/TeamMember"

const Database = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    synchronize: process.env.NODE_ENV === "development", // Auto-create tables in dev
    logging: process.env.NODE_ENV === "development",
    entities: [User, Project, ProjectFile, Team, TeamMember],
    migrations: [],
    subscribers: [],
    ssl: {
        rejectUnauthorized: false
    }
})

export default Database;
