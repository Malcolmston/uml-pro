"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Fraunces, Space_Grotesk } from "next/font/google"

const display = Fraunces({ subsets: ["latin"], weight: ["600", "700"] })
const ui = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"] })

export default function SigninPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        setSuccess(null)

        const form = new FormData(event.currentTarget)
        const payload = {
            identifier: form.get("identifier"),
            password: form.get("password"),
        }

        if (!payload.identifier || !payload.password) {
            setError("Enter your email/username and password.")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch("/api/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()

            if (!response.ok) {
                setError(data?.error ?? "Signin failed.")
                return
            }

            if (data?.token) {
                window.localStorage.setItem("token", data.token)
            }

            setSuccess("Signed in. Redirecting soon.")
            setIsRedirecting(true)
            setTimeout(() => {
                router.push("/dashboard")
            }, 600)
        } catch {
            setError("Network error. Try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className={`${ui.className} min-h-screen bg-[#0f1417] text-[#f4f1ea]`}
        >
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#243a52,transparent_55%),radial-gradient(circle_at_15%_60%,#2f3b2a,transparent_55%),radial-gradient(circle_at_90%_20%,#4b2e2a,transparent_45%)] opacity-90" />
                <div className="absolute -top-20 left-1/4 h-60 w-60 rounded-full bg-[#e0b870] opacity-20 blur-3xl float-slow" />
                <div className="absolute bottom-10 right-1/3 h-44 w-44 rounded-full bg-[#7aa7a3] opacity-25 blur-3xl float-fast" />

                <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
                    <section className="max-w-xl">
                        <p className="text-sm uppercase tracking-[0.3em] text-[#f2c078]">
                            Welcome Back
                        </p>
                        <h1
                            className={`${display.className} mt-5 text-4xl font-semibold leading-tight sm:text-5xl`}
                        >
                            Drop into your workspace and keep building.
                        </h1>
                        <p className="mt-6 text-lg text-[#cfd5d2]">
                            Keep your UML blueprints, releases, and team plans
                            aligned. Sign in to continue where you left off.
                        </p>
                        <div className="mt-10 grid gap-4 sm:grid-cols-2">
                            {[
                                "Instant access to diagrams",
                                "Protected change history",
                                "Team activity snapshots",
                                "Personalized workspace",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
                                >
                                    <p className="text-sm text-[#f4f1ea]">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="w-full max-w-xl">
                        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur">
                            <div className="flex items-center justify-between">
                                <h2
                                    className={`${display.className} text-2xl font-semibold`}
                                >
                                    Sign in
                                </h2>
                                <span className="rounded-full border border-[#f2c078] px-3 py-1 text-xs uppercase tracking-widest text-[#f2c078]">
                                    Secure
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-[#cfd5d2]">
                                Use your email or username to access your account.
                            </p>

                            <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
                                <label className="grid gap-2 text-sm">
                                    Email or username
                                    <input
                                        type="text"
                                        name="identifier"
                                        placeholder="malcolm@umlpro.com"
                                        className="h-12 rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                    />
                                </label>
                                <label className="grid gap-2 text-sm">
                                    Password
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="h-12 rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                    />
                                </label>
                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#cfd5d2]">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-white/20 bg-[#0d1114] text-[#f2c078]"
                                        />
                                        Remember me
                                    </label>
                                    <Link
                                        className="text-[#f2c078] hover:text-[#f4b562]"
                                        href="/reset"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <button
                                    type="submit"
                                    className="mt-2 flex h-12 items-center justify-center rounded-2xl bg-[#f2c078] text-sm font-semibold text-[#1a1a1a] transition hover:translate-y-[-1px] hover:bg-[#f4b562] disabled:cursor-not-allowed disabled:opacity-70"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Signing in..." : "Sign in"}
                                </button>
                            </form>

                            {(error || success) && (
                                <div className="mt-4 rounded-2xl border border-white/10 bg-[#0d1114] px-4 py-3 text-xs">
                                    <p className={error ? "text-[#f4b1a6]" : "text-[#b7e4c7]"}>
                                        {error ?? success}
                                    </p>
                                </div>
                            )}

                            <p className="mt-6 text-xs text-[#9ba3a0]">
                                New to UML Pro?{" "}
                                <Link
                                    className="text-[#f2c078] hover:text-[#f4b562]"
                                    href="/signup"
                                >
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </section>
                </main>
            </div>
            {isRedirecting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1417]/80 backdrop-blur">
                    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-[#f4f1ea]">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f2c078] border-t-transparent" />
                        Redirecting to dashboard...
                    </div>
                </div>
            )}
        </div>
    )
}
