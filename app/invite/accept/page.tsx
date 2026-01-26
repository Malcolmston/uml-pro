import { Suspense } from "react"
import AcceptInviteClient from "./AcceptInviteClient"

export default function AcceptInvitePage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl">
                        <h1 className="text-2xl font-semibold">Team invite</h1>
                        <p className="mt-4 text-sm text-slate-300">Preparing to accept invite...</p>
                    </div>
                </main>
            }
        >
            <AcceptInviteClient />
        </Suspense>
    )
}
