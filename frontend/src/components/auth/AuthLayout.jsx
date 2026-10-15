import { Link } from 'react-router-dom'

function AuthLayout({ eyebrow, title, description, children, footer }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-midnight px-4 py-10 text-left text-ink sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.1),_transparent_68%)]"
      />
      <section className="relative w-full max-w-md rounded-3xl border border-line/80 bg-card p-6 shadow-2xl shadow-black/20 transition duration-300 ease-out hover:border-line hover:shadow-black/30 sm:p-9 motion-reduce:transition-none">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg font-display text-sm font-bold tracking-tight text-ink transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
        >
          <span className="grid size-8 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-4"
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          carewise
        </Link>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary">{description}</p>
        </div>

        {children}
        <div className="mt-7 border-t border-line/70 pt-6 text-center text-sm text-secondary">
          {footer}
        </div>
      </section>
    </main>
  )
}

export default AuthLayout
