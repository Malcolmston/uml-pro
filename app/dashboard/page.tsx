"use client"

import { useEffect, useMemo, useState } from "react"
import { Fraunces, Space_Grotesk } from "next/font/google"

const display = Fraunces({ subsets: ["latin"], weight: ["600", "700"] })
const ui = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"] })

type Team = {
    id: number
    name: string
}

type Project = {
    id: number
    name: string
    description: string | null
    visibility: string
    teamId: number | null
}

type TabKey = "projects" | "teams" | "settings"

const getToken = () => {
    if (typeof window === "undefined") return null
    return window.localStorage.getItem("token")
}

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("projects")
    const [teams, setTeams] = useState<Team[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
    const [personalTeamId, setPersonalTeamId] = useState<number | null>(null)
    const [loadingTeams, setLoadingTeams] = useState(false)
    const [loadingProjects, setLoadingProjects] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [creatingTeam, setCreatingTeam] = useState(false)
    const [teamName, setTeamName] = useState("")
    const [projectName, setProjectName] = useState("")
    const [projectDescription, setProjectDescription] = useState("")
    const [projectVisibility, setProjectVisibility] = useState("public")
    const [creatingProject, setCreatingProject] = useState(false)

    const selectedTeam = useMemo(
        () => teams.find((team) => team.id === selectedTeamId) ?? null,
        [teams, selectedTeamId]
    )

    const personalTeam = useMemo(
        () => teams.find((team) => team.name.endsWith("-team")) ?? null,
        [teams]
    )

    const fetchTeams = async () => {
        setLoadingTeams(true)
        setError(null)
        try {
            const token = getToken()
            const response = await fetch("/api/teams/list", {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            })
            const data = await response.json()
            if (!response.ok) {
                setError(data?.error ?? "Failed to load teams.")
                return
            }
            setTeams(data?.teams ?? [])
            const fallbackTeamId = data?.teams?.[0]?.id ?? null
            const detectedPersonal = (data?.teams ?? []).find((team: Team) =>
                team.name.endsWith("-team")
            )
            setPersonalTeamId(detectedPersonal?.id ?? null)
            if (!selectedTeamId && (detectedPersonal?.id ?? fallbackTeamId)) {
                setSelectedTeamId(detectedPersonal?.id ?? fallbackTeamId)
            }
        } catch {
            setError("Network error while loading teams.")
        } finally {
            setLoadingTeams(false)
        }
    }

    const fetchProjects = async (teamId: number) => {
        setLoadingProjects(true)
        setError(null)
        try {
            const token = getToken()
            const response = await fetch(`/api/teams/${teamId}/projects/list`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            })
            const data = await response.json()
            if (!response.ok) {
                setError(data?.error ?? "Failed to load projects.")
                return
            }
            setProjects(data?.projects ?? [])
        } catch {
            setError("Network error while loading projects.")
        } finally {
            setLoadingProjects(false)
        }
    }

    const createTeam = async (name: string) => {
        const trimmed = name.trim()
        if (!trimmed) {
            setError("Team name is required.")
            return
        }
        setCreatingTeam(true)
        setError(null)
        try {
            const token = getToken()
            const response = await fetch("/api/teams/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ name: trimmed }),
            })
            const data = await response.json()
            if (!response.ok) {
                setError(data?.error ?? "Failed to create team.")
                return
            }
            await fetchTeams()
            if (data?.team?.id) {
                setSelectedTeamId(data.team.id)
                setActiveTab("projects")
            }
            setTeamName("")
        } catch {
            setError("Network error while creating team.")
        } finally {
            setCreatingTeam(false)
        }
    }

    const createProject = async () => {
        if (!selectedTeamId) {
            setError("Select a team before creating a project.")
            return
        }

        const trimmedName = projectName.trim()
        if (!trimmedName) {
            setError("Project name is required.")
            return
        }

        setCreatingProject(true)
        setError(null)
        try {
            const token = getToken()
            const response = await fetch(
                `/api/teams/${selectedTeamId}/projects/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        name: trimmedName,
                        description: projectDescription.trim() || null,
                        visibility: projectVisibility,
                    }),
                }
            )
            const data = await response.json()
            if (!response.ok) {
                setError(data?.error ?? "Failed to create project.")
                return
            }
            setProjectName("")
            setProjectDescription("")
            await fetchProjects(selectedTeamId)
        } catch {
            setError("Network error while creating project.")
        } finally {
            setCreatingProject(false)
        }
    }

    useEffect(() => {
        fetchTeams()
    }, [])

    useEffect(() => {
        if (selectedTeamId !== null) {
            fetchProjects(selectedTeamId)
        }
    }, [selectedTeamId])

    return (
        <div className={`${ui.className} min-h-screen bg-[#0f1417] text-[#f4f1ea]`}>
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#243a52,transparent_55%),radial-gradient(circle_at_15%_60%,#2f3b2a,transparent_55%),radial-gradient(circle_at_90%_20%,#4b2e2a,transparent_45%)] opacity-90" />
                <div className="absolute -top-20 left-1/4 h-60 w-60 rounded-full bg-[#e0b870] opacity-20 blur-3xl float-slow" />
                <div className="absolute bottom-10 right-1/3 h-44 w-44 rounded-full bg-[#7aa7a3] opacity-25 blur-3xl float-fast" />

                <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-[#f2c078]">
                                Dashboard
                            </p>
                            <h1
                                className={`${display.className} mt-4 text-3xl font-semibold sm:text-4xl`}
                            >
                                Keep every blueprint in sync.
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#f4f1ea]">
                            Active: {selectedTeam?.name ?? "No team selected"}
                        </div>
                    </header>

                    <section className="flex flex-wrap items-center gap-3">
                        {(["projects", "teams", "settings"] as TabKey[]).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-full border px-4 py-2 text-sm uppercase tracking-[0.2em] ${
                                    activeTab === tab
                                        ? "border-[#f2c078] text-[#f2c078]"
                                        : "border-white/10 text-[#cfd5d2]"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </section>

                    {error && (
                        <div className="rounded-2xl border border-white/10 bg-[#0d1114] px-4 py-3 text-sm text-[#f4b1a6]">
                            {error}
                        </div>
                    )}

                    {activeTab === "projects" && (
                        <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
                            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#f2c078]">
                                    Teams
                                </p>
                                <div className="mt-4">
                                    <label className="text-sm text-[#cfd5d2]">
                                        Select team
                                    </label>
                                    <select
                                        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea]"
                                        value={selectedTeamId ?? ""}
                                        onChange={(event) =>
                                            setSelectedTeamId(
                                                event.target.value
                                                    ? Number(event.target.value)
                                                    : null
                                            )
                                        }
                                    >
                                        <option value="">Choose...</option>
                                        {teams.map((team) => (
                                            <option key={team.id} value={team.id}>
                                                {team.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-6 text-xs text-[#9ba3a0]">
                                    {loadingTeams
                                        ? "Loading teams..."
                                        : `${teams.length} team(s) available.`}
                                </div>
                                <div className="mt-6 grid gap-3">
                                    <label className="text-xs uppercase tracking-[0.2em] text-[#cfd5d2]">
                                        Team name
                                    </label>
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(event) => setTeamName(event.target.value)}
                                        placeholder="New team name"
                                        className="h-11 w-full rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#cfd5d2] hover:border-[#f2c078] hover:text-[#f2c078] disabled:cursor-not-allowed disabled:opacity-60"
                                        onClick={() => createTeam("personal-team")}
                                        disabled={creatingTeam}
                                    >
                                        Create personal team
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#cfd5d2] hover:border-[#f2c078] hover:text-[#f2c078] disabled:cursor-not-allowed disabled:opacity-60"
                                        onClick={() => createTeam(teamName)}
                                        disabled={creatingTeam}
                                    >
                                        Create team
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[#f2c078]">
                                        Projects
                                    </p>
                                    <span className="text-xs text-[#9ba3a0]">
                                        {loadingProjects
                                            ? "Loading..."
                                            : `${projects.length} total`}
                                    </span>
                                </div>
                                <div className="mt-6 grid gap-4">
                                    <div className="rounded-2xl border border-white/10 bg-[#0d1114] px-5 py-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-[#f2c078]">
                                            New project
                                        </p>
                                        <div className="mt-4 grid gap-3">
                                            <input
                                                type="text"
                                                value={projectName}
                                                onChange={(event) =>
                                                    setProjectName(event.target.value)
                                                }
                                                placeholder="Project name"
                                                className="h-11 w-full rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={projectDescription}
                                                onChange={(event) =>
                                                    setProjectDescription(event.target.value)
                                                }
                                                placeholder="Short description (optional)"
                                                className="h-11 w-full rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                            />
                                            <select
                                                value={projectVisibility}
                                                onChange={(event) =>
                                                    setProjectVisibility(event.target.value)
                                                }
                                                className="h-11 w-full rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea]"
                                            >
                                                <option value="public">Public</option>
                                                <option value="private">Private</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={createProject}
                                                className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#cfd5d2] hover:border-[#f2c078] hover:text-[#f2c078] disabled:cursor-not-allowed disabled:opacity-60"
                                                disabled={creatingProject}
                                            >
                                                {creatingProject
                                                    ? "Creating..."
                                                    : "Create project"}
                                            </button>
                                        </div>
                                    </div>
                                    {personalTeam &&
                                        selectedTeamId === personalTeamId &&
                                        projects.length === 0 &&
                                        !loadingProjects && (
                                            <div className="rounded-2xl border border-white/10 bg-[#0d1114] px-5 py-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-[#f2c078]">
                                                    Personal workspace
                                                </p>
                                                <p className="mt-2 text-sm text-[#cfd5d2]">
                                                    No personal project yet. Create one to
                                                    start modeling your first system.
                                                </p>
                                            </div>
                                        )}
                                    {projects.length === 0 && !loadingProjects && (
                                        <p className="text-sm text-[#cfd5d2]">
                                            No projects yet. Create one from the API.
                                        </p>
                                    )}
                                    {projects.map((project) => (
                                        <button
                                            key={project.id}
                                            type="button"
                                            onClick={() =>
                                                window.location.assign(
                                                    `/project/${project.id}`
                                                )
                                            }
                                            className="w-full rounded-2xl border border-white/10 bg-[#0d1114] px-5 py-4 text-left transition hover:border-[#f2c078]"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold">
                                                    {project.name}
                                                </h3>
                                                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#cfd5d2]">
                                                    {project.visibility}
                                                </span>
                                            </div>
                                            {project.description && (
                                                <p className="mt-2 text-sm text-[#9ba3a0]">
                                                    {project.description}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === "teams" && (
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {teams.map((team) => (
                                <div
                                    key={team.id}
                                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
                                >
                                    <p className="text-xs uppercase tracking-[0.2em] text-[#f2c078]">
                                        Team
                                    </p>
                                    <h3 className="mt-3 text-lg font-semibold">
                                        {team.name}
                                    </h3>
                                    <button
                                        type="button"
                                        className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#cfd5d2]"
                                        onClick={() => {
                                            setSelectedTeamId(team.id)
                                            setActiveTab("projects")
                                        }}
                                    >
                                        View projects
                                    </button>
                                </div>
                            ))}
                            {teams.length === 0 && !loadingTeams && (
                                <p className="text-sm text-[#cfd5d2]">
                                    You have no teams yet.
                                </p>
                            )}
                        </section>
                    )}

                    {activeTab === "settings" && (
                        <section className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#f2c078]">
                                    Profile
                                </p>
                                <p className="mt-3 text-sm text-[#cfd5d2]">
                                    Update your profile via the change endpoints.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#f2c078]">
                                    Security
                                </p>
                                <p className="mt-3 text-sm text-[#cfd5d2]">
                                    Change your password to keep your account safe.
                                </p>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    )
}
