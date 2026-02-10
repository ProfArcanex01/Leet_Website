import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(580px_280px_at_8%_0%,rgba(47,91,255,0.16),transparent_60%),radial-gradient(520px_280px_at_100%_100%,rgba(18,185,129,0.14),transparent_60%)]" />
      <div className="animate-[pulse_3.8s_ease-in-out_infinite] w-full max-w-xl rounded-3xl border border-[color:var(--stroke)] bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--ink)]">Page not found</h1>
        <p className="mt-4 text-base text-[color:var(--muted-foreground)]">
          The page you requested does not exist or is no longer available.
        </p>
        <div className="mt-6 h-px w-full overflow-hidden rounded-full bg-[color:var(--soft)]">
          <div className="h-full w-1/3 animate-[shimmer_1.8s_linear_infinite] bg-gradient-to-r from-transparent via-[color:var(--accent)]/50 to-transparent" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-[color:var(--stroke)] px-5 py-2.5 text-sm font-medium text-[color:var(--ink)] hover:bg-[color:var(--soft)]"
          >
            Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
