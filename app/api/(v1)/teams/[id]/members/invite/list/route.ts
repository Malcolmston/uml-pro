import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { TeamInvite } from "@/app/db/entities/TeamInvite"
import Invite from "@/app/db/invite"
import TeamRole from "@/app/db/teamRole"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import { ensureDb, getMembership } from "../../../../_helpers"

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
    if (!membership || membership.role !== TeamRole.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const invites = await Database.getRepository(TeamInvite).find({
        where: { teamId, status: Invite.PENDING },
        order: { createdAt: "DESC" },
    })

    return NextResponse.json(
        {
            invites: invites.map((invite) => ({
                id: invite.id,
                email: invite.email,
                role: invite.role,
                status: invite.status,
                createdAt: invite.createdAt ? invite.createdAt.toISOString() : null,
            })),
        },
        { status: 200 }
    )
}
