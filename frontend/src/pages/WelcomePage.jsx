import { Link } from 'react-router-dom'

const features = [
  {
    id: 'symptom-guidance',
    icon: 'spark',
    label: 'Planned',
    title: 'AI Symptom Guidance',
    description:
      'A future guided way to describe symptoms and explore general health information—not a diagnosis.',
  },
  {
    id: 'personal-dashboard',
    icon: 'dashboard',
    label: 'Planned',
    title: 'Personalized Dashboard',
    description:
      'A personal space in development for reviewing your health activity and keeping useful details together.',
  },
  {
    id: 'nearby-care',
    icon: 'location',
    label: 'Planned',
    title: 'Nearby Doctors & Clinics',
    description:
      'Local care options will be shown only after a real location and provider-search service is integrated.',
  },
  {
    id: 'private-access',
    icon: 'shield',
    label: 'In progress',
    title: 'Privacy-Focused Access',
    description:
      'Backend account access is being connected to the interface. Avoid entering sensitive health information until the app is complete.',
  },
]

const steps = [
  {
    number: '01',
    icon: 'account',
    title: 'Create your account',
    description: 'Set up a personal space to begin your health journey.',
  },
  {
    number: '02',
    icon: 'notes',
    title: 'Describe your symptoms',
    description: 'Share what you are experiencing in a guided format.',
  },
  {
    number: '03',
    icon: 'compass',
    title: 'Explore a next step',
    description:
      'Review general information or look for appropriate medical care.',
  },
]

function Icon({ name, className = 'size-5' }) {
  const icons = {
    spark: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" />
        <path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="4" rx="1.5" />
        <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    location: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 19 6v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3Z" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
    account: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.5-3.4 3.2-5.5 7-5.5s6.5 2.1 7 5.5" />
      </>
    ),
    notes: (
      <>
        <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
        <path d="M14 3.5v4h4M8.5 12h7M8.5 16h7" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    pulse: <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />,
    cross: <path d="M12 5v14M5 12h14" />,
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name]}
    </svg>
  )
}

function Brand() {
  return (
    <Link
      to="/"
      aria-label="Carewise home"
      className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <span className="grid size-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
        <Icon name="cross" className="size-5" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-ink">
        carewise
      </span>
    </Link>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl px-2 pb-4 pt-2 sm:px-8 sm:py-8">
      <div
        aria-hidden="true"
        className="absolute inset-8 rounded-full bg-gradient-to-br from-accent/10 via-electric/10 to-transparent blur-3xl"
      />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/40" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-line/50" />

      <div className="relative mx-auto max-w-sm rounded-[1.75rem] border border-line bg-card/95 p-5 shadow-2xl shadow-black/40 backdrop-blur sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <Icon name="cross" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-ink">
                Your health space
              </p>
              <p className="mt-0.5 text-xs text-secondary">A thoughtful start</p>
            </div>
          </div>
          <span className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary">
            Preview
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-line/80 bg-field p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary">
                Start with what matters
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-ink">
                How are you feeling?
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-full border border-electric/20 bg-electric/10 text-electric">
              <Icon name="notes" />
            </span>
          </div>
          <div className="mt-4 flex min-h-12 items-center justify-between rounded-xl border border-line bg-midnight px-3.5 text-sm text-secondary">
            <span>Describe what’s on your mind…</span>
            <span className="grid size-7 place-items-center rounded-lg bg-accent text-midnight">
              <Icon name="arrow" className="size-4" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs leading-5 text-secondary">
            <Icon name="shield" className="size-4 shrink-0 text-accent" />
            <span>General information, not a medical diagnosis.</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-line/80 bg-field p-3.5">
            <span className="grid size-8 place-items-center rounded-xl bg-accent/10 text-accent">
              <Icon name="spark" className="size-4" />
            </span>
            <p className="mt-3 text-xs font-semibold text-ink">Health insights</p>
            <p className="mt-1 text-[11px] text-secondary">A clearer next step</p>
          </div>
          <div className="rounded-2xl border border-line/80 bg-field p-3.5">
            <span className="grid size-8 place-items-center rounded-xl bg-electric/10 text-electric">
              <Icon name="location" className="size-4" />
            </span>
            <p className="mt-3 text-xs font-semibold text-ink">Care nearby</p>
            <p className="mt-1 text-[11px] text-secondary">Provider search planned</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line/80 bg-field px-4 py-3">
          <span className="grid size-8 place-items-center rounded-full bg-accent/10 text-accent">
            <Icon name="pulse" className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink">A step at a time</p>
            <p className="mt-0.5 text-[11px] text-secondary">
              Your journey starts with a conversation.
            </p>
          </div>
          <span className="flex h-5 items-center gap-1" aria-hidden="true">
            {[8, 14, 10, 18, 11, 7, 13].map((height, index) => (
              <span
                key={index}
                style={{ height }}
                className={`w-0.5 rounded-full ${
                  index === 3 ? 'bg-electric' : 'bg-accent/60'
                }`}
              />
            ))}
          </span>
        </div>
      </div>

      <div className="absolute -left-1 top-[18%] hidden items-center gap-2.5 rounded-2xl border border-line bg-card px-3.5 py-3 shadow-xl shadow-black/25 sm:flex lg:-left-8 motion-safe:animate-[float_6s_ease-in-out_infinite] motion-reduce:animate-none">
        <span className="grid size-8 place-items-center rounded-xl bg-accent/10 text-accent">
          <Icon name="spark" className="size-4" />
        </span>
        <span>
          <span className="block text-xs font-semibold text-ink">
            Health insights
          </span>
          <span className="mt-0.5 block text-[10px] text-secondary">
            Coming soon
          </span>
        </span>
      </div>

      <div className="absolute -right-1 bottom-[18%] hidden items-center gap-2.5 rounded-2xl border border-line bg-card px-3.5 py-3 shadow-xl shadow-black/25 sm:flex lg:-right-8 motion-safe:animate-[float_7s_ease-in-out_infinite_1s] motion-reduce:animate-none">
        <span className="relative grid size-8 place-items-center rounded-xl bg-electric/10 text-electric">
          <Icon name="pulse" className="size-4" />
          <span className="absolute right-0 top-0 size-2 rounded-full border-2 border-card bg-accent" />
        </span>
        <span>
          <span className="block text-xs font-semibold text-ink">
            Symptom check
          </span>
          <span className="mt-0.5 block text-[10px] text-secondary">
            Guided entry planned
          </span>
        </span>
      </div>
    </div>
  )
}

function FeatureCard({ feature }) {
  return (
    <article
      id={feature.id}
      className="group flex h-full scroll-mt-24 flex-col rounded-3xl border border-line/80 bg-card/80 p-6 transition duration-300 ease-out hover:-translate-y-1 hover:border-accent/35 hover:shadow-xl hover:shadow-accent/[0.06] motion-reduce:transform-none motion-reduce:transition-none sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-2xl border border-accent/15 bg-accent/[0.08] text-accent transition-colors duration-200 group-hover:border-accent/30 group-hover:bg-accent/15 motion-reduce:transition-none">
          <Icon name={feature.icon} className="size-5" />
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
          {feature.label}
        </span>
      </div>
      <h3 className="mt-6 font-display text-lg font-semibold tracking-tight text-ink">
        {feature.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-secondary">
        {feature.description}
      </p>
      <a
        href="#how-it-works"
        className="mt-5 inline-flex w-fit items-center gap-2 rounded-md text-xs font-semibold text-accent/90 transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
      >
        How it works
        <Icon
          name="arrow"
          className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
        />
      </a>
    </article>
  )
}

function WelcomePage() {
  const year = new Date().getFullYear()

  return (
    <main className="min-h-screen overflow-hidden bg-midnight text-left text-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[44rem] bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.12),_transparent_65%)]"
      />

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Brand />
        <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
          <a
            href="#features"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none sm:inline-flex"
          >
            Features
          </a>
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-midnight shadow-lg shadow-accent/10 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-300 hover:shadow-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:px-12 lg:pb-28 lg:pt-20">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.07] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent sm:text-xs">
            <span className="size-1.5 rounded-full bg-accent" />
            A more thoughtful way to explore care
          </p>
          <h1 className="mt-7 max-w-2xl font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.5rem]">
            Your Health.
            <br />
            <span className="bg-gradient-to-r from-accent to-electric bg-clip-text text-transparent">
              Starts Here.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-secondary sm:text-lg sm:leading-8">
            A calmer place to share what you’re feeling, explore general health
            information, and consider a more informed next step.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-midnight shadow-lg shadow-accent/10 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-300 hover:shadow-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
            >
              Get Started
              <Icon name="arrow" className="size-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-card/60 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-5 max-w-lg text-xs leading-5 text-secondary/85">
            Health information is for general education only—not a diagnosis or
            a replacement for professional medical advice.
          </p>
        </div>

        <HeroVisual />
      </section>

      <section
        id="features"
        className="relative scroll-mt-8 border-y border-line/70 bg-[#0a1120] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Designed around you
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              A little more clarity,
              <span className="text-accent"> at every step.</span>
            </h2>
            <p className="mt-4 text-sm leading-6 text-secondary sm:text-base">
              Thoughtful tools are taking shape to help make your health
              journey feel easier to navigate.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative scroll-mt-8 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric">
                How it works
              </p>
              <h2 className="mt-4 max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Your next step,
                <span className="text-accent"> made clearer.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-secondary sm:text-base">
                A simple path from sharing what’s on your mind to exploring
                options for care.
              </p>
              <div className="mt-6 flex gap-3 rounded-2xl border border-electric/20 bg-electric/[0.06] p-4">
                <span className="mt-0.5 shrink-0 text-electric">
                  <Icon name="shield" className="size-5" />
                </span>
                <p className="text-xs leading-5 text-secondary">
                  Any future AI-generated guidance will be informational only.
                  It cannot diagnose conditions or replace advice from a
                  qualified medical professional.
                </p>
              </div>
            </div>

            <ol className="space-y-3">
              {steps.map((step) => (
                <li
                  key={step.number}
                  className="flex gap-4 rounded-2xl border border-line/80 bg-card/70 p-5 transition-colors duration-200 hover:border-accent/25 motion-reduce:transition-none sm:gap-5 sm:p-6"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-accent/15 bg-accent/[0.08] text-accent">
                    <Icon name={step.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-display text-xs font-bold tracking-[0.14em] text-accent">
                        STEP {step.number}
                      </span>
                      <h3 className="font-display text-base font-semibold text-ink sm:text-lg">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-secondary">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <footer className="border-t border-line/80 bg-[#070c17]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.9fr] lg:gap-16">
            <div>
              <Brand footer />
              <p className="mt-5 max-w-sm text-sm leading-6 text-secondary">
                A thoughtful starting point for understanding your health and
                exploring possible care options—one step at a time.
              </p>
            </div>

            <nav aria-label="Quick links">
              <h2 className="font-display text-sm font-semibold text-ink">
                Explore
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-secondary">
                <li>
                  <Link
                    to="/"
                    className="transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                  >
                    Create an account
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Feature links">
              <h2 className="font-display text-sm font-semibold text-ink">
                On the roadmap
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-secondary">
                {features.map((feature) => (
                  <li key={feature.id}>
                    <a
                      href={`#${feature.id}`}
                      className="transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                    >
                      {feature.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-12 rounded-2xl border border-line/80 bg-card/50 p-5 sm:mt-14 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-electric">
              Important health disclaimer
            </p>
            <p className="mt-2 max-w-5xl text-xs leading-5 text-secondary sm:text-sm sm:leading-6">
              Carewise is being developed as an informational tool. It is not
              intended to diagnose, treat, cure, or prevent any condition. For
              medical advice, consult a qualified healthcare professional. If
              you may be experiencing an emergency, contact your local
              emergency services immediately.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-line/70 pt-6 text-xs text-secondary sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} Carewise. All rights reserved.</p>
            <Link
              to="/status"
              className="w-fit rounded-md transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
            >
              Service status
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default WelcomePage
