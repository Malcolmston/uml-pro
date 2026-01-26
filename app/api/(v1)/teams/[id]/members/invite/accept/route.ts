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
    const initialTeamId = Number(id)
    let teamId: number = initialTeamId
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
    
    // Try to find by teamId and token first
    let invite = await inviteRepo.findOne({ 
        where: { teamId, token },
        select: ['id', 'teamId', 'invitedById', 'token', 'email', 'status', 'role', 'acceptedAt']
    })
    
    // If not found, try by token only
    if (!invite) {
        invite = await inviteRepo.findOne({ 
            where: { token },
            select: ['id', 'teamId', 'invitedById', 'token', 'email', 'status', 'role', 'acceptedAt']
        })
        
        if (!invite) {
            return NextResponse.json({ error: "Invite not found" }, { status: 404 })
        }
        
        if (!invite.teamId) {
            return NextResponse.json({ error: "Invite is missing a team" }, { status: 400 })
        }
        teamId = invite.teamId
    }

    if (!Number.isFinite(teamId)) {
        return NextResponse.json({ error: "Invite is missing a team" }, { status: 400 })
    }

    // Additional validation - ensure invite has valid teamId
    if (!invite.teamId || !Number.isFinite(invite.teamId)) {
        return NextResponse.json({ error: "Invite has invalid team ID" }, { status: 400 })
    }
    if (!invite.id) {
        return NextResponse.json({ error: "Invite is missing an id" }, { status: 400 })
    }

    if (invite.status !== Invite.PENDING) {
        return NextResponse.json(
            { error: "Invite is no longer pending", status: invite.status },
            { status: 409 }
        )
    }

    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
        return NextResponse.json({ error: "Invite email mismatch" }, { status: 403 })
    }

    // Use the teamId from the invite to ensure consistency
    teamId = invite.teamId
    const inviteId = invite.id

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
                    } else if (typeof error === 'object' && error !== null && 'detail' in error) {
                        console.error('Database constraint violation:', (error as { detail: string }).detail)
                        throw new Error(`Database constraint violation: ${(error as { detail: string }).detail}`)
                    } else {
                        console.error('Error saving team member:', error)
                        throw error
                    }
                }
            } else {
                // Log that we are ignoring the role for existing member
                console.log(`User ${userId} already member of team ${teamId}, ignoring invite role ${invite.role}`)
            }

            // Update invite status within the same transaction
            const inviteRepo = entityManager.getRepository(TeamInvite)
            
            const acceptedAt = new Date()
            // Update by id to avoid writing null foreign keys from legacy rows.
            invite.status = Invite.ACCEPTED
            invite.acceptedAt = acceptedAt
            await inviteRepo.update(
                { id: inviteId },
                {
                    status: Invite.ACCEPTED,
                    acceptedAt,
                    teamId,
                }
            )
        })
    } catch (error) {
        console.error("Invite acceptance transaction failed:", {
            error: error instanceof Error ? error.message : String(error),
            teamId,
            userId,
            token: token.substring(0, 4) + '...',
            inviteStatus: invite.status
        })
        
        // Provide more specific error messages for common issues
        if (error instanceof Error) {
            if (error.message.includes('constraint violation')) {
                return NextResponse.json({ error: "Database constraint violation: " + error.message }, { status: 400 })
            }
            if (error.message.includes('Invite not found during update')) {
                return NextResponse.json({ error: "Invite was modified or deleted" }, { status: 409 })
            }
        }
        
        return NextResponse.json({ 
            error: "Failed to process invite acceptance",
            details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
}
