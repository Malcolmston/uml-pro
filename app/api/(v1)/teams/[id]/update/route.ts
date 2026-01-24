import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { Team } from "@/app/db/entities/Team"
import TeamRole from "@/app/db/teamRole"
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
    const { name, customRules, defaultRole } = body ?? {}

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

    const membership = await getMembership(userId, teamId)
    if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const team = await getTeamById(teamId)
    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    if ((name !== undefined || defaultRole !== undefined) && membership.role !== TeamRole.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (name !== undefined) {
        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { error: "Team name must be a string" },
                { status: 400 }
            )
        }
        team.name = name
    }

    if (defaultRole) {
        team.defaultRole = defaultRole
    }

    if (customRules !== undefined) {
        if (!team.canModifyTeamRules(membership.role)) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            )
        }
        team.setCustomRules(membership.role, customRules)
    }

    await Database.getRepository(Team).save(team)

    return NextResponse.json(
        { team: toTeamDTO(team, membership.role) },
        { status: 200 }
    )
}
