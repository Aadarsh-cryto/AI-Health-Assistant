import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHealthStatus } from '../services/healthService.js'

function HealthStatusPage() {
  const [status, setStatus] = useState('checking')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let isCurrent = true

    getHealthStatus()
      .then(() => {
        if (isCurrent) {
          setStatus('connected')
        }
      })
      .catch(() => {
        if (isCurrent) {
          setStatus('unavailable')
        }
      })

    return () => {
      isCurrent = false
    }
  }, [attempt])

  return (
    <main className="flex min-h-screen items-center justify-center bg-midnight px-4 py-10 text-left text-ink">
      <section className="w-full max-w-lg rounded-3xl border border-line bg-card p-7 shadow-2xl shadow-black/20 sm:p-9">
        <Link
          to="/"
          className="rounded-md text-sm font-semibold text-secondary transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
        >
          ← Back to Carewise
        </Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Service check
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Connection status
        </h1>
        <p
          role="status"
          aria-live="polite"
          className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-6 ${
            status === 'connected'
              ? 'border-accent/30 bg-accent/10 text-teal-100'
              : status === 'unavailable'
                ? 'border-rose-400/30 bg-rose-400/10 text-rose-200'
                : 'border-electric/30 bg-electric/10 text-blue-100'
          }`}
        >
          {status === 'checking' && 'Checking the backend connection…'}
          {status === 'connected' && 'Backend connection is healthy.'}
          {status === 'unavailable' &&
            'Backend health check failed. Confirm the backend is running and MongoDB is connected.'}
        </p>
        {status !== 'checking' && (
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-5 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-midnight transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
          >
            Check again
          </button>
        )}
      </section>
    </main>
  )
}

export default HealthStatusPage
