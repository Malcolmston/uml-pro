import { NextRequest, NextResponse } from "next/server"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import { ensureDb, getMembership, getTeamById, toTeamDTO } from "../../_helpers"

export async function GET(
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

    await ensureDb()

    const membership = await getMembership(userId, teamId)
    if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const team = await getTeamById(teamId)
    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json(
        { team: toTeamDTO(team, membership.role) },
        { status: 200 }
    )
}
