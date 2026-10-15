import { Link, useLocation } from 'react-router-dom'
import DashboardIcon from './DashboardIcon.jsx'

const navigation = [
  { id: 'overview', label: 'Overview', icon: 'overview', href: '#overview' },
  {
    id: 'symptoms',
    label: 'AI Symptom Checker',
    icon: 'pulse',
    href: '/symptom-checker',
  },
  {
    id: 'doctors',
    label: 'Find a Doctor',
    icon: 'location',
    href: '/doctors',
  },
  {
    id: 'profile',
    label: 'Health Profile',
    icon: 'profile',
    href: '/health-profile',
  },
  {
    id: 'history',
    label: 'Health History',
    icon: 'history',
    href: '/health-history',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    href: '#privacy',
    upcoming: true,
  },
]

function DashboardSidebar({
  user,
  isOpen,
  isSigningOut,
  onClose,
  onSignOut,
  onComingSoon,
  activeItem,
  onSelect,
}) {
  const location = useLocation()
  const initials = user?.name
    ?.split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function handleNavigation(item) {
    onSelect(item.id)
    if (item.upcoming) {
      onComingSoon(item.label)
    }
    onClose()
  }

  return (
    <aside
      aria-label="Dashboard sidebar"
      role={isOpen ? 'dialog' : undefined}
      aria-modal={isOpen ? 'true' : undefined}
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line/70 bg-[#0a1120] px-4 py-5 transition-transform duration-300 ease-out motion-reduce:transition-none lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          onClick={onClose}
        >
          <span className="grid size-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>
            <span className="block font-display text-sm font-bold tracking-tight text-ink">
              AI Health
            </span>
            <span className="mt-0.5 block text-[11px] text-secondary">
              ASSISTANT
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="rounded-lg p-2 text-secondary transition-colors hover:bg-white/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
        >
          <DashboardIcon name="close" />
        </button>
      </div>

      <p className="mb-3 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary/70">
        Workspace
      </p>
      <nav aria-label="Dashboard navigation" className="space-y-1">
        {navigation.map((item) => {
          const active =
            location.pathname === item.href ||
            (location.pathname === '/dashboard' && activeItem === item.id)

          return (
            <Link
              key={item.id}
              to={item.href}
              onClick={() => handleNavigation(item)}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none ${
                active
                  ? 'border border-accent/15 bg-accent/10 text-accent'
                  : 'border border-transparent text-secondary hover:bg-white/[0.04] hover:text-ink'
              }`}
            >
              <DashboardIcon
                name={item.icon}
                className={`size-[18px] shrink-0 ${
                  active
                    ? 'text-accent'
                    : 'text-secondary transition-colors group-hover:text-ink'
                }`}
              />
              <span className="min-w-0 flex-1">{item.label}</span>
              {item.upcoming && (
                <span className="rounded-full border border-line px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-secondary/75">
                  Soon
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <div className="mb-4 rounded-2xl border border-electric/15 bg-electric/[0.05] p-3.5">
          <div className="flex items-center gap-2 text-electric">
            <DashboardIcon name="lock" className="size-4" />
            <p className="text-xs font-semibold">Your session is private</p>
          </div>
          <p className="mt-2 text-[11px] leading-4 text-secondary">
            This dashboard is an informational tool, not a medical service.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-line/80 bg-card/70 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent/25 to-electric/25 font-display text-xs font-bold text-ink">
            {initials || 'U'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-ink">
              {user?.name ?? 'Your account'}
            </span>
            <span className="mt-0.5 block truncate text-[10px] text-secondary">
              {user?.email ?? ''}
            </span>
          </span>
          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-secondary transition-colors hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
          >
            {isSigningOut ? '…' : 'Exit'}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default DashboardSidebar
