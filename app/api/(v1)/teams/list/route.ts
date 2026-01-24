import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { Team } from "@/app/db/entities/Team"
import { TeamMember } from "@/app/db/entities/TeamMember"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import { ensureDb, toTeamDTO } from "../_helpers"

export async function GET(request: NextRequest) {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await ensureDb()

    const memberRepo = Database.getRepository(TeamMember)
    const memberships = await memberRepo.find({
        where: { userId },
        relations: ["team"],
    })

    const teams = memberships
        .filter((membership) => membership.team)
        .map((membership) => toTeamDTO(membership.team as Team, membership.role))

    return NextResponse.json({ teams }, { status: 200 })
}
