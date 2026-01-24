import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import Database from "@/app/db/connect"
import { TeamInvite } from "@/app/db/entities/TeamInvite"
import TeamRole from "@/app/db/teamRole"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import { sendTeamInviteEmail } from "@/app/utils/email"
import { ensureDb, getMembership, getTeamById } from "../../../../_helpers"

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
    if (!invite) {
        return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    if (invite.status !== "pending") {
        return NextResponse.json({ error: "Invite is not pending" }, { status: 400 })
    }

    invite.token = crypto.randomBytes(32).toString("hex")
    await inviteRepo.save(invite)

    const team = await getTeamById(teamId)
    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    try {
        await sendTeamInviteEmail({
            email: invite.email,
            teamName: team.name,
            token: invite.token,
        })
    } catch (error) {
        console.error("Invite email error:", error)
        return NextResponse.json(
            { error: "Invite updated but email failed to send" },
            { status: 500 }
        )
    }

    return NextResponse.json(
        {
            invite: {
                id: invite.id,
                email: invite.email,
                role: invite.role,
                token: invite.token,
            },
        },
        { status: 200 }
    )
}
