import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { Team } from "@/app/db/entities/Team"
import { TeamMember } from "@/app/db/entities/TeamMember"
import TeamRole from "@/app/db/teamRole"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import { ensureDb, isValidCustomRules, toTeamDTO } from "../_helpers"

export async function POST(request: NextRequest) {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, customRules, defaultRole } = body ?? {}

    if (!name || typeof name !== "string") {
        return NextResponse.json(
            { error: "Team name is required" },
            { status: 400 }
        )
    }

    if (customRules !== undefined && !isValidCustomRules(customRules)) {
        return NextResponse.json(
            { error: "Invalid permissions payload" },
            { status: 400 }
        )
    }

    if (defaultRole && !Object.values(TeamRole).includes(defaultRole)) {
        return NextResponse.json(
            { error: "Invalid default role" },
            { status: 400 }
        )
    }

    await ensureDb()

    const teamRepo = Database.getRepository(Team)
    const memberRepo = Database.getRepository(TeamMember)

    const team = new Team()
    team.name = name
    if (defaultRole) {
        team.defaultRole = defaultRole
    }

    if (customRules) {
        team.setCustomRules(TeamRole.ADMIN, customRules)
    }

    await teamRepo.save(team)

    const member = new TeamMember()
    member.teamId = team.id
    member.userId = userId
    member.role = TeamRole.ADMIN
    await memberRepo.save(member)

    return NextResponse.json({ team: toTeamDTO(team, member.role) }, { status: 201 })
}
