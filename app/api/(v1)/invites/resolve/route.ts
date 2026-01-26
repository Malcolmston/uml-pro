import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { TeamInvite } from "@/app/db/entities/TeamInvite"
import Invite from "@/app/db/invite"
import { ensureDb } from "../../teams/_helpers"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
        return NextResponse.json({ error: "Invite token is required" }, { status: 400 })
    }

    await ensureDb()

    const inviteRepo = Database.getRepository(TeamInvite)
    const invite = await inviteRepo.findOne({ where: { token, status: Invite.PENDING } })
    if (!invite) {
        return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    return NextResponse.json(
        {
            teamId: invite.teamId,
            email: invite.email,
        },
        { status: 200 }
    )
}
