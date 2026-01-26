"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

type InviteStatus = "idle" | "loading" | "success" | "error" | "unauthorized"

const statusCopy: Record<InviteStatus, string> = {
    idle: "Preparing to accept invite...",
    loading: "Accepting invite...",
    success: "Invite accepted. You can return to the app.",
    error: "We could not accept this invite.",
    unauthorized: "Please sign in to accept this invite.",
}

export default function AcceptInviteClient() {
    const searchParams = useSearchParams()
    const teamIdParam = searchParams.get("teamId")
    const token = searchParams.get("token")
    const [status, setStatus] = useState<InviteStatus>("idle")
    const [message, setMessage] = useState<string>(statusCopy.idle)
    const [signinError, setSigninError] = useState<string | null>(null)
    const [isSigningIn, setIsSigningIn] = useState(false)

    const resolveTeamId = useCallback(async (inviteToken: string) => {
        const response = await fetch(
            `/api/invites/resolve?token=${encodeURIComponent(inviteToken)}`
        )
        if (!response.ok) {
            return null
        }
        const payload = await response.json().catch(() => null)
        const resolvedTeamId = Number(payload?.teamId)
        return Number.isFinite(resolvedTeamId) ? resolvedTeamId : null
    }, [])

    const acceptInvite = useCallback(async () => {
        if (!token) {
            setStatus("error")
            setMessage("Invite link is missing required parameters.")
            return
        }

        let teamId: number | null = Number(teamIdParam)
        if (!Number.isFinite(teamId)) {
            teamId = await resolveTeamId(token)
        }

        if (teamId === null || !Number.isFinite(teamId)) {
            setStatus("error")
            setMessage("Invite link is invalid or expired. Ask your admin to resend it.")
            return
        }
        const resolvedTeamId = teamId

        const authToken = window.localStorage.getItem("token")
        if (!authToken) {
            setStatus("unauthorized")
            setMessage(statusCopy.unauthorized)
            return
        }

        setStatus("loading")
        setMessage(statusCopy.loading)

        try {
            const response = await fetch(`/api/teams/${resolvedTeamId}/members/invite/accept`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ token }),
            })

            if (!response.ok) {
                const payload = await response.json().catch(() => null)
                if (response.status === 401) {
                    setStatus("unauthorized")
                    setMessage(statusCopy.unauthorized)
                    return
                }
                if (response.status === 409) {
                    setStatus("error")
                    setMessage("Invite already accepted or revoked.")
                    return
                }
                setStatus("error")
                setMessage(payload?.error ?? statusCopy.error)
                return
            }

            setStatus("success")
            setMessage(statusCopy.success)
        } catch {
            setStatus("error")
            setMessage("Network error while accepting invite.")
        }
    }, [resolveTeamId, teamIdParam, token])

    useEffect(() => {
        acceptInvite()
    }, [acceptInvite])

    const handleSignin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSigninError(null)

        const form = new FormData(event.currentTarget)
        const payload = {
            identifier: form.get("identifier"),
            password: form.get("password"),
        }

        if (!payload.identifier || !payload.password) {
            setSigninError("Enter your email/username and password.")
            return
        }

        setIsSigningIn(true)
        try {
            const response = await fetch("/api/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()

            if (!response.ok) {
                setSigninError(data?.error ?? "Signin failed.")
                return
            }

            if (data?.token) {
                window.localStorage.setItem("token", data.token)
            }

            await acceptInvite()
        } catch {
            setSigninError("Network error. Try again.")
        } finally {
            setIsSigningIn(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
            <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl">
                <h1 className="text-2xl font-semibold">Team invite</h1>
                <p className="mt-4 text-sm text-slate-300">{message}</p>
                {status === "unauthorized" ? (
                    <div className="mt-6 text-left">
                        <p className="text-xs text-slate-400">
                            Sign in to accept this invite.
                        </p>
                        <form className="mt-4 grid gap-3" onSubmit={handleSignin}>
                            <label className="grid gap-2 text-xs text-slate-300">
                                Email or username
                                <input
                                    type="text"
                                    name="identifier"
                                    placeholder="you@umlpro.com"
                                    className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                                />
                            </label>
                            <label className="grid gap-2 text-xs text-slate-300">
                                Password
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                                />
                            </label>
                            <button
                                type="submit"
                                className="mt-2 flex h-11 items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={isSigningIn}
                            >
                                {isSigningIn ? "Signing in..." : "Sign in and accept"}
                            </button>
                        </form>
                        {signinError ? (
                            <p className="mt-3 text-xs text-rose-300">{signinError}</p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </main>
    )
}
