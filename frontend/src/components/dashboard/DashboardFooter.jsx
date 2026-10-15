import { Link } from 'react-router-dom'

function DashboardFooter() {
  return (
    <footer className="mt-10 flex flex-col gap-4 border-t border-line/70 py-6 text-[11px] text-secondary sm:flex-row sm:items-center sm:justify-between">
      <p>
        <span className="font-display font-semibold text-ink">
          AI Health Assistant
        </span>
        <span className="mx-2 text-line">·</span>
        General information, not medical advice.
      </p>
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2">
        <a
          href="#privacy"
          className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Privacy
        </a>
        <Link
          to="/"
          className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          About
        </Link>
        <a
          href="#privacy"
          className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Help &amp; safety
        </a>
        <a
          href="#privacy"
          className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Medical disclaimer
        </a>
      </nav>
    </footer>
  )
}

export default DashboardFooter
