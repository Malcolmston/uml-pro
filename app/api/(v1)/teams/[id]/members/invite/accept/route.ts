import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { TeamInvite } from "@/app/db/entities/TeamInvite"
import Invite from "@/app/db/invite"
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

    let body
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }
    
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
    if (!invite || invite.status !== Invite.PENDING) {
        return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
        return NextResponse.json({ error: "Invite email mismatch" }, { status: 403 })
    }

    try {
        await Database.transaction(async (entityManager) => {
            const memberRepo = entityManager.getRepository(TeamMember)
            const existing = await memberRepo.findOne({ where: { teamId, userId } })
            
            if (!existing) {
                const member = new TeamMember()
                member.teamId = teamId
                member.userId = userId
                member.role = invite.role
                try {
                    await memberRepo.save(member)
                } catch (error: unknown) {
                    // Ignore duplicate key error (concurrent insert)
                    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === '23505') {
                        console.log(`User ${userId} already member of team ${teamId} (race condition caught)`)
                    } else {
                        throw error
                    }
                }
            } else {
                // Log that we are ignoring the role for existing member
                console.log(`User ${userId} already member of team ${teamId}, ignoring invite role ${invite.role}`)
            }

            invite.status = Invite.ACCEPTED
            invite.acceptedAt = new Date()
            await entityManager.getRepository(TeamInvite).save(invite)
        })
    } catch (error) {
        console.error("Invite acceptance transaction failed:", error)
        return NextResponse.json({ error: "Failed to process invite acceptance" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
}
