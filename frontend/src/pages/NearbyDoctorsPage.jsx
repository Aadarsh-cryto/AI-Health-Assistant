import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError, getJson } from '../services/api.js'
import {
  buildGoogleMapsSpecialtySearches,
  getDoctorNavigationState,
  SPECIALTY_LABELS,
  validateDoctorSearchCity,
} from '../services/doctorSpecialty.js'

const INITIAL_CITY = 'Raipur, Chhattisgarh, India'

function NearbyDoctorsPage() {
  const routerLocation = useLocation()
  const navigate = useNavigate()
  const [specialties] = useState(
    () => getDoctorNavigationState(routerLocation.state).specialties,
  )
  const [city, setCity] = useState(INITIAL_CITY)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [sessionAttempt, setSessionAttempt] = useState(0)
  const [fieldError, setFieldError] = useState('')
  const [searches, setSearches] = useState(null)

  useEffect(() => {
    let isCurrent = true

    getJson('/api/auth/me')
      .then((response) => {
        if (!response?.user) {
          throw new Error('Could not verify your session. Please try again.')
        }
      })
      .catch((requestError) => {
        if (!isCurrent) return
        if (requestError instanceof ApiError && requestError.status === 401) {
          navigate('/login', {
            replace: true,
            state: { notice: 'Please sign in to find doctors.' },
          })
          return
        }
        setSessionError(
          requestError.message || 'Could not verify your session.',
        )
      })
      .finally(() => {
        if (isCurrent) setIsCheckingSession(false)
      })

    return () => {
      isCurrent = false
    }
  }, [navigate, sessionAttempt])

  function searchDoctors(event) {
    event.preventDefault()
    const validation = validateDoctorSearchCity(city)
    if (validation.error) {
      setFieldError(validation.error)
      setSearches(null)
      return
    }

    setCity(validation.city)
    setFieldError('')
    setSearches(
      buildGoogleMapsSpecialtySearches(validation.city, specialties),
    )
  }

  function retrySessionCheck() {
    setSessionError('')
    setIsCheckingSession(true)
    setSessionAttempt((attempt) => attempt + 1)
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight px-4 text-ink">
        <p role="status" aria-live="polite" className="text-sm text-secondary">
          Checking your session…
        </p>
      </main>
    )
  }

  if (sessionError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight px-4 text-ink">
        <section className="w-full max-w-md rounded-2xl border border-line bg-card p-6">
          <h1 className="font-display text-lg font-semibold">
            Doctor search unavailable
          </h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-secondary">
            {sessionError}
          </p>
          <button
            type="button"
            onClick={retrySessionCheck}
            className="mt-5 min-h-10 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-midnight transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Retry
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-midnight px-4 py-6 text-ink sm:px-7 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/dashboard"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-secondary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span aria-hidden="true">←</span>
          Back to dashboard
        </Link>

        <header className="mt-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric">
            Local care options
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Find Doctors &amp; Clinics
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary sm:text-base sm:leading-7">
            Search Google Maps for broad care categories suggested by your
            symptom analysis. The suggestions are not a diagnosis or a
            confirmation that you need a specialist.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Suggested categories">
            {specialties.map((specialty) => (
              <li
                key={specialty}
                className="rounded-full border border-electric/20 bg-electric/[0.06] px-3 py-1.5 text-xs font-medium text-electric"
              >
                {SPECIALTY_LABELS[specialty]}
              </li>
            ))}
          </ul>
        </header>

        <form
          onSubmit={searchDoctors}
          className="mt-7 rounded-3xl border border-line/80 bg-card/80 p-5 sm:p-7"
        >
          <label
            htmlFor="doctor-city"
            className="block text-sm font-semibold text-ink"
          >
            City or locality
          </label>
          <p id="doctor-city-hint" className="mt-1 text-xs text-secondary">
            Enter a city such as Raipur, Kanpur, Delhi, London, or New York.
          </p>
          <input
            id="doctor-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            maxLength={120}
            value={city}
            onChange={(event) => {
              setCity(event.target.value)
              setFieldError('')
            }}
            aria-describedby={
              fieldError
                ? 'doctor-city-hint doctor-city-error'
                : 'doctor-city-hint'
            }
            aria-invalid={Boolean(fieldError)}
            className="mt-3 min-h-12 w-full rounded-xl border border-line bg-field px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-secondary/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Enter a city or locality"
          />
          {fieldError && (
            <p
              id="doctor-city-error"
              role="alert"
              className="mt-2 text-xs text-rose-200"
            >
              {fieldError}
            </p>
          )}
          <button
            type="submit"
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-bold text-midnight transition duration-200 hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99] sm:w-auto"
          >
            Show Google Maps searches
          </button>
        </form>

        {searches && (
          <section
            aria-labelledby="map-searches-title"
            aria-live="polite"
            className="mt-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Google Maps searches
            </p>
            <h2
              id="map-searches-title"
              className="mt-2 font-display text-xl font-semibold"
            >
              Suggested searches for {city}
            </h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              Google Maps provides its current search results. This app does not
              verify providers, credentials, availability, or the accuracy of
              map listings. Confirm a clinician&apos;s credentials and
              availability directly before making care decisions.
            </p>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {searches.map((search) => (
                <li
                  key={`${search.specialty}:${search.searchTerm}`}
                  className="rounded-2xl border border-line/80 bg-card/80 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-electric">
                    {search.specialtyLabel}
                  </p>
                  <h3 className="mt-2 font-display text-base font-semibold text-ink">
                    {search.searchTerm} in {city}
                  </h3>
                  <a
                    href={search.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Search Google Maps for ${search.searchTerm} in ${city} (opens in a new tab)`}
                    className="mt-4 inline-flex min-h-10 items-center rounded-lg text-sm font-semibold text-accent underline underline-offset-4 transition-colors hover:text-teal-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    Open Google Maps
                    <span className="ml-2" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-8 text-xs leading-5 text-secondary">
          The symptom analysis and specialty suggestions are general
          information only, not a diagnosis or personalized medical advice. If
          symptoms may be life-threatening, contact local emergency services
          immediately.
        </p>
      </div>
    </main>
  )
}

export default NearbyDoctorsPage
