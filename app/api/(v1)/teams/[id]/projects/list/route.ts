import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { Project } from "@/app/db/entities/Project"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import { ensureDb, getMembership, getTeamById } from "../../../_helpers"

const toProjectDTO = (project: Project) => ({
    id: project.id,
    uuid: project.uuid,
    name: project.name,
    description: project.description,
    visibility: project.visibility,
    teamId: project.teamId,
    createdAt: project.createdAt ? project.createdAt.toISOString() : null,
    updatedAt: project.updatedAt ? project.updatedAt.toISOString() : null,
})

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

    const allowed = team.canPerform(membership.role, "read", "bucket")
    if (allowed === false) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const projects = await Database.getRepository(Project).find({
        where: { teamId },
    })

    return NextResponse.json(
        { projects: projects.map(toProjectDTO) },
        { status: 200 }
    )
}
