import { useState } from 'react'
import DashboardIcon from './DashboardIcon.jsx'

function DashboardTopbar({
  user,
  searchQuery,
  onSearchChange,
  onOpenMenu,
  isMobileMenuOpen,
  onSignOut,
  isSigningOut,
  onToast,
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
  const initials = user?.name
    ?.split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-midnight/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3.5 sm:px-7 lg:px-10">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          aria-expanded={isMobileMenuOpen}
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-card text-secondary transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
        >
          <span className="flex flex-col gap-1" aria-hidden="true">
            <span className="h-0.5 w-4 rounded bg-current" />
            <span className="h-0.5 w-4 rounded bg-current" />
            <span className="h-0.5 w-4 rounded bg-current" />
          </span>
        </button>

        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="font-display text-sm font-semibold text-ink">
            Good day{user?.name ? `, ${user.name.split(/\s+/)[0]}` : ''}
          </p>
          <p className="mt-0.5 text-xs text-secondary">{today}</p>
        </div>

        <label className="relative ml-auto min-w-0 flex-1 sm:ml-0 sm:max-w-xs">
          <span className="sr-only">Search dashboard features</span>
          <DashboardIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search dashboard"
            className="h-10 w-full rounded-xl border border-line bg-field pl-9 pr-3 text-xs text-ink outline-none transition duration-200 placeholder:text-secondary/65 hover:border-secondary/40 focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10 motion-reduce:transition-none"
          />
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen((open) => !open)
              setIsProfileOpen(false)
            }}
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-card text-secondary transition-colors hover:border-accent/30 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <DashboardIcon name="bell" className="size-[18px]" />
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-line bg-card p-4 shadow-2xl shadow-black/40">
              <p className="font-display text-sm font-semibold text-ink">
                Notifications
              </p>
              <p className="mt-2 text-xs leading-5 text-secondary">
                You’re all caught up. There are no notifications yet.
              </p>
              <p className="mt-2 text-[10px] leading-4 text-secondary/75">
                No medical alerts or health activity are available here.
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((open) => !open)
              setIsNotificationsOpen(false)
            }}
            aria-label="Open profile menu"
            aria-expanded={isProfileOpen}
            className="flex h-10 items-center gap-2 rounded-xl border border-line bg-card pl-1.5 pr-2 text-xs font-semibold text-ink transition-colors hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-accent/25 to-electric/25 font-display text-[10px] text-ink">
              {initials || 'U'}
            </span>
            <span className="hidden max-w-24 truncate sm:inline">
              {user?.name?.split(/\s+/)[0] ?? 'Account'}
            </span>
            <DashboardIcon
              name="chevron"
              className="hidden size-3.5 text-secondary sm:block"
            />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 top-12 z-40 w-60 rounded-2xl border border-line bg-card p-3 shadow-2xl shadow-black/40">
              <div className="border-b border-line/70 px-2 pb-3">
                <p className="truncate text-sm font-semibold text-ink">
                  {user?.name}
                </p>
                <p className="mt-1 truncate text-xs text-secondary">
                  {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false)
                  onToast('Profile settings are not available yet.')
                }}
                className="mt-2 w-full rounded-lg px-2 py-2 text-left text-xs font-medium text-secondary transition-colors hover:bg-white/[0.04] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Account settings · Coming soon
              </button>
              <button
                type="button"
                onClick={onSignOut}
                disabled={isSigningOut}
                className="w-full rounded-lg px-2 py-2 text-left text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
              >
                {isSigningOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default DashboardTopbar
