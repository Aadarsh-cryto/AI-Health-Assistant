import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardContent from '../components/dashboard/DashboardContent.jsx'
import DashboardFooter from '../components/dashboard/DashboardFooter.jsx'
import DashboardSidebar from '../components/dashboard/DashboardSidebar.jsx'
import DashboardTopbar from '../components/dashboard/DashboardTopbar.jsx'
import { ApiError, getJson, postJson } from '../services/api.js'

function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [toast, setToast] = useState(location.state?.notice ?? '')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeItem, setActiveItem] = useState('overview')

  useEffect(() => {
    let isCurrent = true

    getJson('/api/auth/me')
      .then((result) => {
        if (!result?.user) {
          throw new Error('Could not verify your session. Please try again.')
        }
        if (isCurrent) setUser(result.user)
      })
      .catch((requestError) => {
        if (!isCurrent) return

        if (requestError instanceof ApiError && requestError.status === 401) {
          navigate('/login', {
            replace: true,
            state: { notice: 'Please sign in to access your dashboard.' },
          })
          return
        }

        setError(requestError.message || 'Could not verify your session.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [attempt, navigate])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function handleRetry() {
    setError('')
    setIsLoading(true)
    setAttempt((value) => value + 1)
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    setError('')

    try {
      await postJson('/api/auth/logout', {})
      navigate('/login', {
        replace: true,
        state: { notice: 'You have been signed out.' },
      })
    } catch (requestError) {
      setError(requestError.message || 'Could not sign out. Please try again.')
      setIsSigningOut(false)
    }
  }

  function showComingSoon(feature) {
    setToast(`${feature} is not available yet.`)
    setIsMobileMenuOpen(false)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight px-4 text-ink">
        <p role="status" aria-live="polite" className="text-sm text-secondary">
          Checking your session…
        </p>
      </main>
    )
  }

  if (!user && !error) return null

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight px-4 text-ink">
        <section className="w-full max-w-md rounded-2xl border border-line bg-card p-6 sm:p-8">
          <p className="font-display text-lg font-semibold">Dashboard unavailable</p>
          <p role="alert" className="mt-3 text-sm leading-6 text-secondary">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-6 min-h-10 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-midnight transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Retry
          </button>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-midnight text-ink">
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <DashboardSidebar
        user={user}
        isOpen={isMobileMenuOpen}
        isSigningOut={isSigningOut}
        onClose={() => setIsMobileMenuOpen(false)}
        onSignOut={handleSignOut}
        onComingSoon={showComingSoon}
        activeItem={activeItem}
        onSelect={setActiveItem}
      />

      <div className="min-h-screen lg:pl-72">
        <DashboardTopbar
          user={user}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          onSignOut={handleSignOut}
          isSigningOut={isSigningOut}
          onToast={setToast}
        />

        <main className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-7 lg:px-10">
          {error && (
            <div
              role="alert"
              className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-4 text-sm leading-6 text-rose-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <p>{error}</p>
              {!user && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-fit rounded-lg border border-rose-200/20 px-3 py-1.5 font-semibold transition-colors hover:bg-rose-200/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <DashboardContent
            user={user}
            searchQuery={searchQuery}
            onComingSoon={showComingSoon}
          />
          <DashboardFooter />
        </main>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-accent/25 bg-card px-4 py-3.5 text-sm text-ink shadow-2xl shadow-black/40"
        >
          <span className="mt-0.5 size-2 shrink-0 rounded-full bg-accent" />
          <p className="flex-1 leading-5">{toast}</p>
          <button
            type="button"
            onClick={() => setToast('')}
            aria-label="Dismiss notification"
            className="rounded-md px-1 text-secondary transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
