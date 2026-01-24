import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import Database from "@/app/db/connect"
import { TeamInvite } from "@/app/db/entities/TeamInvite"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import { sendTeamInviteEmail } from "@/app/utils/email"
import TeamRole from "@/app/db/teamRole"
import { ensureDb, getMembership, getTeamById } from "../../../_helpers"

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

    let body
    try {
        body = await request.json()
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { email, role } = body ?? {}

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (role && !Object.values(TeamRole).includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await ensureDb()

    const membership = await getMembership(userId, teamId)
    if (!membership || membership.role !== TeamRole.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const team = await getTeamById(teamId)
    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const invite = new TeamInvite()
    invite.teamId = teamId
    invite.invitedById = userId
    invite.email = email
    invite.role = role ?? TeamRole.MEMBER
    invite.token = crypto.randomBytes(32).toString("hex")

    await Database.getRepository(TeamInvite).save(invite)

    try {
        await sendTeamInviteEmail({
            email: invite.email,
            teamName: team.name,
            token: invite.token,
        })
    } catch (error) {
        console.error("Invite email error:", error)
        try {
            if (invite.id) {
                await Database.getRepository(TeamInvite).delete(invite.id)
            } else {
                await Database.getRepository(TeamInvite).delete({ token: invite.token })
            }
        } catch (deleteError) {
            console.error("Failed to rollback invite:", deleteError)
        }
        return NextResponse.json(
            { error: "Invite created but email failed to send and invite was deleted" },
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
        { status: 201 }
    )
}
