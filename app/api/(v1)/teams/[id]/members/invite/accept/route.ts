import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { TeamInvite } from "@/app/db/entities/TeamInvite"
import { TeamMember } from "@/app/db/entities/TeamMember"
import { User } from "@/app/db/entities/User"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import { ensureDb } from "../../../../_helpers"

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
    const { token } = body ?? {}
    if (!token || typeof token !== "string") {
        return NextResponse.json({ error: "Invite token is required" }, { status: 400 })
    }

    await ensureDb()

    const userRepo = Database.getRepository(User)
    const user = await userRepo.findOne({ where: { id: userId } })
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const inviteRepo = Database.getRepository(TeamInvite)
    const invite = await inviteRepo.findOne({ where: { teamId, token } })
    if (!invite || invite.status !== "pending") {
        return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
        return NextResponse.json({ error: "Invite email mismatch" }, { status: 403 })
    }

    const memberRepo = Database.getRepository(TeamMember)
    const existing = await memberRepo.findOne({ where: { teamId, userId } })
    if (!existing) {
        const member = new TeamMember()
        member.teamId = teamId
        member.userId = userId
        member.role = invite.role
        await memberRepo.save(member)
    }

    invite.status = "accepted"
    invite.acceptedAt = new Date()
    await inviteRepo.save(invite)

    return NextResponse.json({ success: true }, { status: 200 })
}
