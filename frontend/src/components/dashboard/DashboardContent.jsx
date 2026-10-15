import { useNavigate } from 'react-router-dom'
import DashboardIcon from './DashboardIcon.jsx'

const overviewCards = [
  {
    id: 'symptom-checker',
    icon: 'pulse',
    eyebrow: 'Guided support',
    title: 'Symptom Checker',
    description: 'Explore general information about symptoms you describe.',
    status: 'Available',
    href: '/symptom-checker',
    accent: 'text-accent',
    iconBg: 'bg-accent/10',
    line: 'border-accent/20',
  },
  {
    id: 'find-doctors',
    icon: 'location',
    eyebrow: 'Care options',
    title: 'Find a Doctor',
    description: 'Open Google Maps searches for suggested specialties in a city.',
    status: 'Available',
    href: '/doctors',
    accent: 'text-electric',
    iconBg: 'bg-electric/10',
    line: 'border-electric/20',
  },
  {
    id: 'health-profile',
    icon: 'profile',
    eyebrow: 'Your details',
    title: 'Health Profile',
    description: 'Optionally save and update personal health details.',
    status: 'Available',
    href: '/health-profile',
    accent: 'text-violet-300',
    iconBg: 'bg-violet-400/10',
    line: 'border-violet-300/20',
  },
  {
    id: 'health-history',
    icon: 'history',
    eyebrow: 'Your activity',
    title: 'Health History',
    description: 'Review symptom analyses you explicitly chose to save.',
    status: 'Available',
    href: '/health-history',
    accent: 'text-amber-200',
    iconBg: 'bg-amber-300/10',
    line: 'border-amber-200/20',
  },
]

const nextSteps = [
  'Keep a note of questions you may want to ask a healthcare professional.',
  'For urgent or severe symptoms, contact local emergency services.',
  'Use trusted healthcare professionals for personal medical advice.',
]

function OverviewCard({ card, onAction }) {
  return (
    <button
      id={card.id}
      type="button"
      onClick={() => onAction(card)}
      className="group flex min-h-48 scroll-mt-28 flex-col rounded-2xl border border-line/80 bg-card p-5 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <span
          className={`grid size-10 place-items-center rounded-xl border ${card.line} ${card.iconBg} ${card.accent}`}
        >
          <DashboardIcon name={card.icon} className="size-[18px]" />
        </span>
        <span className="rounded-full border border-line px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-secondary">
          {card.status}
        </span>
      </div>
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/75">
        {card.eyebrow}
      </p>
      <h3 className="mt-1.5 font-display text-base font-semibold text-ink">
        {card.title}
      </h3>
      <p className="mt-2 text-xs leading-5 text-secondary">
        {card.description}
      </p>
      <span className="mt-auto flex items-center gap-2 pt-4 text-[11px] font-semibold text-secondary transition-colors group-hover:text-accent">
        {card.href
          ? card.id === 'find-doctors'
            ? 'Find care'
            : card.id === 'health-history'
              ? 'View history'
              : card.id === 'health-profile'
                ? 'Edit profile'
                : 'Start a check'
          : 'Preview'}
        <DashboardIcon name="arrow" className="size-3.5" />
      </span>
    </button>
  )
}

function DashboardContent({ user, searchQuery, onComingSoon }) {
  const navigate = useNavigate()
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredCards = overviewCards.filter((card) =>
    `${card.title} ${card.description} ${card.status}`
      .toLowerCase()
      .includes(normalizedQuery),
  )
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there'

  function handleCardAction(card) {
    if (card.href) {
      navigate(card.href)
      return
    }
    onComingSoon(card.title)
  }

  return (
    <>
      <section
        id="overview"
        className="relative mt-6 scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-line/80 bg-gradient-to-br from-[#132238] via-card to-[#101928] p-6 sm:mt-8 sm:p-8 lg:p-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-accent/[0.09] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-8rem] right-[20%] size-64 rounded-full bg-electric/[0.08] blur-3xl"
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_0.75fr]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              <DashboardIcon name="spark" className="size-3.5" />
              Your personal health space
            </p>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Your health,
              <br className="hidden sm:block" /> understood{' '}
              <span className="bg-gradient-to-r from-accent to-electric bg-clip-text text-transparent">
                better.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-secondary sm:text-base sm:leading-7">
              Explore your health insights, track your wellness, and take your
              next step with confidence. New tools are being built thoughtfully.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/symptom-checker')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-midnight shadow-lg shadow-accent/10 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
              >
                Check My Symptoms
                <DashboardIcon name="arrow" className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-midnight/30 px-5 py-2.5 text-xs font-semibold text-ink transition-colors duration-200 hover:border-electric/40 hover:text-electric focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric motion-reduce:transition-none"
              >
                Find a Doctor
              </button>
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-sm lg:block">
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-accent/20 to-electric/15 blur-3xl" />
            <div className="relative rounded-[1.75rem] border border-line/80 bg-midnight/70 p-5 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-accent/10 text-accent">
                    <DashboardIcon name="pulse" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink">
                      Your health journey
                    </p>
                    <p className="mt-0.5 text-[10px] text-secondary">
                      Ready when you are
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-line px-2 py-1 text-[9px] uppercase tracking-wider text-secondary">
                  Preview
                </span>
              </div>
              <div className="mt-5 rounded-2xl border border-line/80 bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium text-secondary">
                      First step
                    </p>
                    <p className="mt-1 font-display text-sm font-semibold text-ink">
                      Start with a conversation
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full border border-electric/20 bg-electric/10 text-electric">
                    <DashboardIcon name="notes" />
                  </span>
                </div>
                <div className="mt-4 flex h-9 items-center gap-2 rounded-xl border border-line bg-field px-3 text-[10px] text-secondary">
                  <span className="size-1.5 rounded-full bg-accent" />
                  Your health data will appear here when available
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-accent/15 bg-accent/[0.05] px-3 py-2.5 text-[10px] leading-4 text-secondary">
                <DashboardIcon
                  name="shield"
                  className="size-4 shrink-0 text-accent"
                />
                No personal health activity is recorded yet.
              </div>
            </div>
            <span className="absolute -right-2 top-10 grid size-10 place-items-center rounded-2xl border border-line bg-card text-electric shadow-lg motion-safe:animate-float motion-reduce:animate-none">
              <DashboardIcon name="spark" />
            </span>
          </div>
        </div>
      </section>

      <section className="mt-10 sm:mt-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              Overview
            </p>
            <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight sm:text-2xl">
              Your health tools
            </h2>
          </div>
          <p className="text-xs text-secondary">
            Welcome, <span className="font-medium text-ink">{firstName}</span>
          </p>
        </div>

        {filteredCards.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {filteredCards.map((card) => (
              <OverviewCard
                key={card.id}
                card={card}
                onAction={handleCardAction}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-card/50 px-5 py-8 text-center">
            <p className="font-display text-sm font-semibold text-ink">
              No matching dashboard tools
            </p>
            <p className="mt-2 text-xs text-secondary">
              Try another search term.
            </p>
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-[1.25fr_0.75fr]">
        <article
          id="health-journey"
          className="scroll-mt-28 rounded-3xl border border-line/80 bg-card/70 p-5 sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-electric">
                Your Health Journey
              </p>
              <h2 className="mt-2 font-display text-lg font-semibold">
                Every journey starts somewhere.
              </h2>
            </div>
            <span className="grid size-10 place-items-center rounded-xl border border-electric/15 bg-electric/[0.08] text-electric">
              <DashboardIcon name="history" />
            </span>
          </div>

          <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-line bg-field/70 p-5 sm:flex-row sm:items-center sm:gap-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-accent/15 bg-accent/[0.08] text-accent">
              <DashboardIcon name="notes" className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">
                Health History is private and opt-in
              </p>
              <p className="mt-1.5 max-w-xl text-xs leading-5 text-secondary">
                Only successful symptom analyses that you explicitly choose
                to save are added to your account history.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/health-history')}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-accent/25 px-3.5 py-2.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              View Health History
              <DashboardIcon name="arrow" className="size-3.5" />
            </button>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <article className="rounded-3xl border border-line/80 bg-card/70 p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              Quick Actions
            </p>
            <h2 className="mt-2 font-display text-lg font-semibold">
              What would you like to do?
            </h2>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => navigate('/symptom-checker')}
                className="flex items-center gap-3 rounded-xl border border-line bg-field/70 px-3.5 py-3 text-left transition-colors hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <DashboardIcon name="pulse" className="size-4 text-accent" />
                <span className="flex-1 text-xs font-medium text-ink">
                  Start a symptom check
                </span>
                <span className="text-[9px] uppercase tracking-wider text-secondary">
                  Available
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="flex items-center gap-3 rounded-xl border border-line bg-field/70 px-3.5 py-3 text-left transition-colors hover:border-electric/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
              >
                <DashboardIcon
                  name="location"
                  className="size-4 text-electric"
                />
                <span className="flex-1 text-xs font-medium text-ink">
                  Find a Doctor
                </span>
                <span className="text-[9px] uppercase tracking-wider text-secondary">
                  Available
                </span>
              </button>
            </div>
          </article>

          <article className="rounded-3xl border border-line/80 bg-card/70 p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-electric">
              Your Next Steps
            </p>
            <ul className="mt-3 space-y-2.5">
              {nextSteps.map((step) => (
                <li key={step} className="flex gap-2.5 text-xs leading-5 text-secondary">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-electric/80" />
                  {step}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section
        id="privacy"
        className="mt-4 scroll-mt-28 rounded-2xl border border-electric/15 bg-electric/[0.045] p-4 sm:mt-5 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-electric">
            <DashboardIcon name="shield" className="size-[18px]" />
          </span>
          <div>
            <h2 className="text-xs font-semibold text-ink">
              Informational support, not medical care
            </h2>
            <p className="mt-1.5 max-w-4xl text-[11px] leading-5 text-secondary">
              This application is still in development. It does not provide a
              diagnosis, replace a qualified healthcare professional, or
              offer medical diagnosis or provider search. If you
              think you may be experiencing an emergency, contact local
              emergency services.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default DashboardContent
