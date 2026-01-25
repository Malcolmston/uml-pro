import { NextRequest, NextResponse } from "next/server"
import Database from "@/app/db/connect"
import { Project } from "@/app/db/entities/Project"
import { ProjectFile } from "@/app/db/entities/ProjectFile"
import { getUserIdFromRequest } from "@/app/utils/jwt-node"
import { deleteFile, fileExists, uploadFile } from "@/app/utils/s3"
import {
    ensureDb,
    getMembership,
    getTeamById,
    getTeamProjectById,
} from "../../_helpers"

type StoreBody = {
    projectId?: number
    filePath?: string
    content?: string
    encoding?: "base64" | "utf8"
    mimeType?: string
}

export async function PUT(
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
        return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const body = (await request.json()) as StoreBody
    const { projectId, filePath, content, encoding = "utf8", mimeType } = body ?? {}

    if (!projectId || !Number.isFinite(projectId)) {
        return NextResponse.json({ error: "Invalid projectId" }, { status: 400 })
    }

    if (!filePath || typeof filePath !== "string") {
        return NextResponse.json({ error: "filePath is required" }, { status: 400 })
    }

    if (!content || typeof content !== "string") {
        return NextResponse.json({ error: "content is required" }, { status: 400 })
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

    const project = await getTeamProjectById(teamId, Number(projectId))
    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const bucketName = `project-${project.uuid}-files`
    const exists = await fileExists(bucketName, filePath)
    const requiredAction = exists ? "update" : "create"
    const allowed = team.canPerform(membership.role, requiredAction, "file")
    if (allowed === false) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const buffer = encoding === "base64"
        ? Buffer.from(content, "base64")
        : Buffer.from(content, "utf8")
    const blob = new Blob([buffer], {
        type: mimeType || "application/octet-stream"
    })

    if (exists) {
        const deleteResult = await deleteFile(bucketName, filePath)
        if (deleteResult.error) {
            return NextResponse.json(
                { error: deleteResult.error.message },
                { status: 500 }
            )
        }
    }

    const uploadResult = await uploadFile(bucketName, blob, filePath)
    if (uploadResult.error) {
        return NextResponse.json(
            { error: uploadResult.error.message },
            { status: 500 }
        )
    }

    if (!project.id) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const projectFileRepo = Database.getRepository(ProjectFile)
    const existingFile = await projectFileRepo.findOne({
        where: { projectId: project.id, fileName: filePath }
    })

    const fileSize = buffer.length
    const nextFile = existingFile ?? new ProjectFile()
    nextFile.project = project as Project
    nextFile.projectId = project.id
    nextFile.fileName = filePath
    nextFile.s3Bucket = bucketName
    nextFile.s3Key = filePath
    nextFile.fileSize = fileSize
    nextFile.mimeType = mimeType ?? null

    await projectFileRepo.save(nextFile)

    return NextResponse.json(
        {
            success: true,
            file: {
                path: filePath,
                size: fileSize,
                mimeType: mimeType ?? null
            }
        },
        { status: 200 }
    )
}
