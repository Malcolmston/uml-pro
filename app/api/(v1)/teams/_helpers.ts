import Database from "@/app/db/connect"
import { Project } from "@/app/db/entities/Project"
import { Team } from "@/app/db/entities/Team"
import { TeamMember } from "@/app/db/entities/TeamMember"
import TeamRole from "@/app/db/teamRole"

export type CustomRules = Record<string, Record<string, boolean | null>>

export const ensureDb = async () => {
    if (!Database.isInitialized) {
        await Database.initialize()
    }
}

export const toTeamDTO = (team: Team, role?: TeamRole) => ({
    id: team.id,
    name: team.name,
    customRules: team.customRules,
    defaultRole: team.defaultRole,
    role,
    createdAt: team.createdAt ? team.createdAt.toISOString() : null,
    updatedAt: team.updatedAt ? team.updatedAt.toISOString() : null,
})

export const isValidCustomRules = (rules: unknown): rules is CustomRules => {
    if (!rules || typeof rules !== "object" || Array.isArray(rules)) return false
    for (const action of Object.keys(rules as Record<string, unknown>)) {
        const resources = (rules as Record<string, unknown>)[action]
        if (!resources || typeof resources !== "object" || Array.isArray(resources)) {
            return false
        }
        for (const value of Object.values(resources as Record<string, unknown>)) {
            if (!(value === true || value === false || value === null)) {
                return false
            }
        }
    }
    return true
}

export const getMembership = async (userId: number, teamId: number) => {
    const memberRepo = Database.getRepository(TeamMember)
    return await memberRepo.findOne({ where: { userId, teamId } })
}

export const getTeamById = async (teamId: number) => {
    const teamRepo = Database.getRepository(Team)
    return await teamRepo.findOne({ where: { id: teamId } })
}

export const getTeamProjectById = async (teamId: number, projectId: number) => {
    const projectRepo = Database.getRepository(Project)
    return await projectRepo.findOne({ where: { id: projectId, teamId } })
}
