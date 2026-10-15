import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-midnight px-4 py-10 text-center text-ink">
      <section className="max-w-md rounded-3xl border border-line bg-card p-8 shadow-2xl shadow-black/20 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          404 · Not found
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-secondary">
          The page may have moved, or the address may be incorrect.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-midnight transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
        >
          Return to Carewise
        </Link>
      </section>
    </main>
  )
}

export default NotFoundPage
