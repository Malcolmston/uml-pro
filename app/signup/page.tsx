"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Fraunces, Space_Grotesk } from "next/font/google"

const display = Fraunces({ subsets: ["latin"], weight: ["600", "700"] })
const ui = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"] })

export default function SignupPage() {
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
            firstName: form.get("firstName"),
            lastName: form.get("lastName"),
            email: form.get("email"),
            username: form.get("username"),
            password: form.get("password"),
            cofPassword: form.get("cofPassword"),
            age: Number(form.get("age")),
        }

        if (
            !payload.firstName ||
            !payload.lastName ||
            !payload.email ||
            !payload.username ||
            !payload.password ||
            !payload.cofPassword ||
            !Number.isFinite(payload.age)
        ) {
            setError("Please fill out every field.")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()

            if (!response.ok) {
                setError(data?.error ?? "Signup failed.")
                return
            }

            if (data?.token) {
                window.localStorage.setItem("token", data.token)
            }

            setSuccess("Account created. Redirecting to dashboard.")
            event.currentTarget.reset()
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#254b58,transparent_55%),radial-gradient(circle_at_20%_70%,#27304a,transparent_55%),radial-gradient(circle_at_90%_20%,#4a2b2a,transparent_45%)] opacity-90" />
                <div className="absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-[#d08c60] opacity-20 blur-3xl float-slow" />
                <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-[#6a9f7f] opacity-25 blur-3xl float-fast" />

                <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
                    <section className="max-w-xl">
                        <p className="text-sm uppercase tracking-[0.3em] text-[#f2c078]">
                            Create Workspace
                        </p>
                        <h1
                            className={`${display.className} mt-5 text-4xl font-semibold leading-tight sm:text-5xl`}
                        >
                            Build your architecture with clarity, not chaos.
                        </h1>
                        <p className="mt-6 text-lg text-[#cfd5d2]">
                            UML Pro gives your team a living map of systems, roles,
                            and releases. Start with a free account and keep your
                            projects aligned from day one.
                        </p>
                        <div className="mt-10 grid gap-4 sm:grid-cols-2">
                            {[
                                "Blueprint dashboards",
                                "Team-ready templates",
                                "Realtime change tracking",
                                "Secure cloud storage",
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
                                    Sign up
                                </h2>
                                <span className="rounded-full border border-[#f2c078] px-3 py-1 text-xs uppercase tracking-widest text-[#f2c078]">
                                    2 min
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-[#cfd5d2]">
                                Create your account and unlock project-ready
                                blueprints.
                            </p>

                            <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="grid gap-2 text-sm">
                                        First name
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="Malcolm"
                                            className="h-12 rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                        />
                                    </label>
                                    <label className="grid gap-2 text-sm">
                                        Last name
                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Stone"
                                            className="h-12 rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                        />
                                    </label>
                                </div>
                                <label className="grid gap-2 text-sm">
                                    Email
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="malcolm@umlpro.com"
                                        className="h-12 rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                    />
                                </label>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="grid gap-2 text-sm">
                                        Username
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="blueprint.dev"
                                            className="h-12 rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                        />
                                    </label>
                                    <label className="grid gap-2 text-sm">
                                        Age
                                        <input
                                            type="number"
                                            name="age"
                                            min={13}
                                            placeholder="18"
                                            className="h-12 rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                        />
                                    </label>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="grid gap-2 text-sm">
                                        Password
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
                                            className="h-12 rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                        />
                                    </label>
                                    <label className="grid gap-2 text-sm">
                                        Confirm
                                        <input
                                            type="password"
                                            name="cofPassword"
                                            placeholder="••••••••"
                                            className="h-12 rounded-2xl border border-white/10 bg-[#0d1114] px-4 text-sm text-[#f4f1ea] placeholder:text-[#6f7572] focus:border-[#f2c078] focus:outline-none"
                                        />
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className="mt-2 flex h-12 items-center justify-center rounded-2xl bg-[#f2c078] text-sm font-semibold text-[#1a1a1a] transition hover:translate-y-[-1px] hover:bg-[#f4b562] disabled:cursor-not-allowed disabled:opacity-70"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Creating..." : "Create account"}
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
                                By continuing you agree to UML Pro terms and
                                confirm you are at least 13 years old.
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
