import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { Project } from "@/app/db/entities/Project"
import Visibility from "@/app/db/visibility"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import {
    ensureDb,
    getMembership,
    getTeamById,
    getTeamProjectById,
} from "../../../../_helpers"

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

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string; projectId: string }> }
) {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, projectId } = await context.params
    const teamId = Number(id)
    const targetProjectId = Number(projectId)
    if (!Number.isFinite(teamId) || !Number.isFinite(targetProjectId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, visibility } = body ?? {}

    await ensureDb()

    const membership = await getMembership(userId, teamId)
    if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const team = await getTeamById(teamId)
    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const allowed = team.canPerform(membership.role, "update", "bucket")
    if (allowed === false) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const project = await getTeamProjectById(teamId, targetProjectId)
    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (name !== undefined) {
        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { error: "Project name must be a string" },
                { status: 400 }
            )
        }
        project.name = name
    }

    if (description !== undefined) {
        project.description = description ?? null
    }

    if (visibility && Object.values(Visibility).includes(visibility)) {
        project.visibility = visibility
    }

    await Database.getRepository(Project).save(project)

    return NextResponse.json({ project: toProjectDTO(project) }, { status: 200 })
}
