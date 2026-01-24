import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { TeamInvite } from "@/app/db/entities/TeamInvite"
import TeamRole from "@/app/db/teamRole"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import { ensureDb, getMembership } from "../../../../_helpers"

export async function POST(
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
    const { inviteId } = body ?? {}
    const targetInviteId = Number(inviteId)
    if (!Number.isFinite(targetInviteId)) {
        return NextResponse.json({ error: "Invite id is required" }, { status: 400 })
    }

    await ensureDb()

    const membership = await getMembership(userId, teamId)
    if (!membership || membership.role !== TeamRole.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const inviteRepo = Database.getRepository(TeamInvite)
    const invite = await inviteRepo.findOne({ where: { id: targetInviteId, teamId } })
    if (!invite || invite.status !== "pending") {
        return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    invite.status = "revoked"
    await inviteRepo.save(invite)

    return NextResponse.json({ success: true }, { status: 200 })
}
