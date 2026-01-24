import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { Team } from "@/app/db/entities/Team"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import {
    ensureDb,
    getMembership,
    getTeamById,
    isValidCustomRules,
    toTeamDTO,
} from "../../_helpers"

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const teamId = Number(id)
    if (!Number.isFinite(teamId)) {
        return NextResponse.json({ error: "Invalid team id" }, { status: 400 })
    }

    const body = await request.json()
    const { customRules } = body ?? {}

    if (!isValidCustomRules(customRules)) {
        return NextResponse.json(
            { error: "Invalid permissions payload" },
            { status: 400 }
        )
    }

    await ensureDb()

    const membership = await getMembership(userId, teamId)
    if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const team = await getTeamById(teamId)
    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    if (!team.canModifyTeamRules(membership.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    team.setCustomRules(membership.role, customRules)
    await Database.getRepository(Team).save(team)

    return NextResponse.json({ team: toTeamDTO(team, membership.role) }, { status: 200 })
}
