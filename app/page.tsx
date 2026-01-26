export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-slate-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="text-lg font-semibold uppercase tracking-[0.2em]">UML Pro</div>
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
          {["home", "about", "pricing", "account"].map((item) => (
            <a
              key={item}
              href={`#${item}`}
              className="rounded-t-xl border border-b-0 border-slate-900/20 bg-white px-4 py-2 shadow-[0_-4px_8px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-slate-900/40"
            >
              {item}
            </a>
          ))}
        </nav>
      </header>

      <section id="home" className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-16 pt-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">Design Systems, Faster</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Model complex systems with clarity, not chaos.
          </h1>
          <p className="text-lg text-slate-700">
            UML Pro keeps your architecture readable with live diagrams, shared history, and a workflow
            that fits teams of every size.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Start a project
            </button>
            <button className="rounded-full border border-slate-900 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white">
              View demo
            </button>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live Snapshot</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Saved
              </span>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:24px_24px] p-6">
              <div className="space-y-3">
                <div className="h-3 w-1/2 rounded-full bg-slate-200" />
                <div className="h-3 w-2/3 rounded-full bg-slate-200" />
                <div className="h-3 w-1/3 rounded-full bg-slate-200" />
              </div>
              <div className="mt-6 grid gap-3">
                <div className="h-10 rounded-2xl bg-amber-100" />
                <div className="h-10 rounded-2xl bg-slate-100" />
                <div className="h-10 rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-white p-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">About</p>
          <h2 className="mt-3 text-3xl font-semibold">A studio for system thinkers.</h2>
          <p className="mt-4 text-slate-600">
            UML Pro was built for teams that need to move fast while keeping architecture readable.
            Capture intent, iterate on structure, and replay decisions with a full timeline of changes.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {["Timeline history", "Role-based collaboration", "Fast exports"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold">{item}</p>
                <p className="mt-2 text-xs text-slate-600">
                  Stay aligned with clear snapshots and an always-on audit trail.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-[0_16px_30px_rgba(15,23,42,0.08)] text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Pricing</p>
          <h2 className="mt-4 text-3xl font-semibold">Coming soon.</h2>
          <p className="mt-3 text-sm text-slate-600">
            We are finalizing plans that fit solo builders through enterprise teams.
          </p>
          <button className="mt-6 rounded-full border border-slate-900 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white">
            Notify me
          </button>
        </div>
      </section>

      <section id="account" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Account</p>
          <h2 className="mt-3 text-3xl font-semibold">Jump back into your workspace.</h2>
          <p className="mt-4 text-slate-600">
            Sign in to access your projects, manage team roles, and keep work moving forward.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/signup"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="rounded-full border border-slate-900 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white"
            >
              Create account
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
