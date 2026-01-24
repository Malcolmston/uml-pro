import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { Project } from "@/app/db/entities/Project"
import Visibility from "@/app/db/visibility"
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
    const { name, description, visibility } = body ?? {}

    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Project name is required" }, { status: 400 })
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

    const project = new Project()
    project.name = name
    project.description = description ?? null
    if (visibility && Object.values(Visibility).includes(visibility)) {
        project.visibility = visibility
    }
    project.teamId = teamId

    await Database.getRepository(Project).save(project)

    return NextResponse.json({ project: toProjectDTO(project) }, { status: 201 })
}
