import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, getJson } from '../services/api.js'
import {
  getHealthProfile,
  getHealthProfileViewMode,
  saveHealthProfile,
} from '../services/healthRecords.js'

const EMPTY_PROFILE = {
  age: '',
  allergies: '',
  conditions: '',
  medications: '',
  notes: '',
}

const PROFILE_FIELDS = [
  { name: 'age', label: 'Age', type: 'number', maxLength: undefined },
  { name: 'allergies', label: 'Allergies', type: 'textarea', maxLength: 1000 },
  {
    name: 'conditions',
    label: 'Existing medical conditions',
    type: 'textarea',
    maxLength: 1000,
  },
  {
    name: 'medications',
    label: 'Current medications',
    type: 'textarea',
    maxLength: 1000,
  },
  {
    name: 'notes',
    label: 'Additional health notes',
    type: 'textarea',
    maxLength: 1000,
  },
]

function normalizeProfile(profile = {}) {
  return {
    age: profile.age == null ? '' : String(profile.age),
    allergies: profile.allergies ?? '',
    conditions: profile.conditions ?? '',
    medications: profile.medications ?? '',
    notes: profile.notes ?? '',
  }
}

function ReportField({ label, value }) {
  return (
    <section className="rounded-xl border border-line bg-field/70 p-4 sm:p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
        {label}
      </h2>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink">
        {value || 'Not provided'}
      </p>
    </section>
  )
}

function HealthProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [userName, setUserName] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [isReportView, setIsReportView] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [attempt, setAttempt] = useState(0)

  const loadProfile = useCallback(async () => {
    try {
      const [profileResponse, userResponse] = await Promise.all([
        getHealthProfile(),
        getJson('/api/auth/me'),
      ])
      setProfile(normalizeProfile(profileResponse.profile))
      setHasProfile(profileResponse.hasProfile === true)
      setUpdatedAt(profileResponse.updatedAt ?? null)
      setIsReportView(profileResponse.hasProfile === true)
      setUserName(
        typeof userResponse.user?.name === 'string' ? userResponse.user.name : '',
      )
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        navigate('/login', {
          replace: true,
          state: { notice: 'Please sign in to view your Health Profile.' },
        })
        return
      }
      setLoadError(requestError.message || 'Could not load your Health Profile.')
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsLoading(true)
      setLoadError('')
      loadProfile()
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [attempt, loadProfile])

  function updateField(event) {
    setProfile((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
    setFieldErrors((current) => ({
      ...current,
      [event.target.name]: undefined,
    }))
    setSuccess('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')
    setFieldErrors({})

    const age = profile.age.trim() === '' ? null : Number(profile.age.trim())
    if (age !== null && (!Number.isInteger(age) || age < 13 || age > 120)) {
      setFieldErrors({ age: 'Age must be a whole number between 13 and 120.' })
      setIsSaving(false)
      return
    }

    try {
      const response = await saveHealthProfile({ ...profile, age })
      setProfile(normalizeProfile(response.profile))
      setHasProfile(true)
      setUpdatedAt(response.updatedAt ?? new Date().toISOString())
      setIsReportView(true)
      setSuccess('Your Health Report has been saved.')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        navigate('/login', {
          replace: true,
          state: { notice: 'Please sign in to save your Health Profile.' },
        })
        return
      }
      if (requestError.errors) setFieldErrors(requestError.errors)
      setError(requestError.message || 'Could not save your Health Profile.')
    } finally {
      setIsSaving(false)
    }
  }

  function startEditing() {
    setProfile(normalizeProfile(profile))
    setIsReportView(false)
    setSuccess('')
    setError('')
    setFieldErrors({})
  }

  function printReport() {
    window.print()
  }

  const viewMode = getHealthProfileViewMode({
    isLoading,
    error: loadError,
    hasProfile,
    isEditing: !isReportView,
  })

  return (
    <main className="min-h-screen bg-midnight px-4 py-6 text-ink sm:px-7 sm:py-8 lg:px-10 print:min-h-0 print:bg-white print:p-0 print:text-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/dashboard"
          data-print-hidden
          className="inline-flex min-h-10 items-center rounded-lg text-sm font-medium text-secondary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          ← Back to dashboard
        </Link>
        <header data-print-hidden className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric">
            Optional personal information
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Health Profile
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary">
            This profile is optional. Choose what, if anything, to save. Your
            information is stored with your account and is not placed in
            browser storage.
          </p>
        </header>

        {viewMode === 'loading' ? (
          <p role="status" aria-live="polite" className="mt-7 text-sm text-secondary">
            Loading your Health Profile…
          </p>
        ) : viewMode === 'error' ? (
          <section data-print-hidden className="mt-7 rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] p-5">
            <p role="alert" className="text-sm text-rose-200">{loadError}</p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="mt-4 min-h-10 rounded-lg border border-rose-200/30 px-4 py-2 text-sm font-semibold text-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
            >
              Retry
            </button>
          </section>
        ) : viewMode === 'report' ? (
          <section
            aria-labelledby="health-report-title"
            className="mt-7 rounded-3xl border border-line/80 bg-card/80 p-5 sm:p-8 print:mt-0 print:rounded-none print:border-0 print:bg-white print:p-0"
          >
            <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between print:border-slate-300">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent print:text-slate-600">
                  Personal record
                </p>
                <h1
                  id="health-report-title"
                  className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl print:text-slate-900"
                >
                  Personal Health Report
                </h1>
                {userName && (
                  <p className="mt-2 text-sm text-secondary print:text-slate-600">
                    Patient: {userName}
                  </p>
                )}
              </div>
              <div data-print-hidden className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={printReport}
                  className="min-h-10 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Print / Save as PDF
                </button>
                <button
                  type="button"
                  onClick={startEditing}
                  className="min-h-10 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-midnight transition-colors hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Edit Report
                </button>
              </div>
            </div>

            {success && (
              <p
                role="status"
                aria-live="polite"
                data-print-hidden
                className="mt-5 rounded-xl border border-accent/20 bg-accent/[0.07] px-4 py-3 text-sm text-accent"
              >
                {success}
              </p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 print:grid-cols-2">
              <ReportField
                label="Age"
                value={profile.age ? `${profile.age} years` : ''}
              />
              <ReportField label="Allergies" value={profile.allergies} />
              <ReportField
                label="Existing medical conditions"
                value={profile.conditions}
              />
              <ReportField
                label="Current medications"
                value={profile.medications}
              />
              <div className="sm:col-span-2">
                <ReportField
                  label="Additional health notes"
                  value={profile.notes}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-sm print:border-slate-300">
              <p className="text-secondary print:text-slate-700">
                Last updated:{' '}
                {updatedAt && Number.isFinite(Date.parse(updatedAt))
                  ? new Date(updatedAt).toLocaleString()
                  : 'Date unavailable'}
              </p>
              <p className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 leading-6 text-amber-100 print:border-slate-300 print:bg-white print:text-slate-800">
                This report summarizes information provided by the user. It is
                not a medical diagnosis.
              </p>
            </div>
          </section>
        ) : (
          <>
            <section
              data-print-hidden
              className="mt-7 rounded-2xl border border-line/80 bg-card/70 p-5 sm:p-6"
            >
              <h2 className="font-display text-lg font-semibold">
                Your Health Report is not saved yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-secondary">
                Add only the optional information you want to keep. After you
                save, you can review it here and edit it at any time.
              </p>
            </section>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-5 rounded-3xl border border-line/80 bg-card/80 p-5 sm:p-7"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {PROFILE_FIELDS.map((field) => (
                  <div
                    key={field.name}
                    className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                  >
                    <label
                      htmlFor={`profile-${field.name}`}
                      className="block text-sm font-semibold text-ink"
                    >
                      {field.label}{' '}
                      <span className="font-normal text-secondary">(optional)</span>
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={`profile-${field.name}`}
                        name={field.name}
                        rows={3}
                        maxLength={field.maxLength}
                        value={profile[field.name]}
                        onChange={updateField}
                        aria-invalid={Boolean(fieldErrors[field.name])}
                        aria-describedby={
                          fieldErrors[field.name]
                            ? `profile-${field.name}-error`
                            : undefined
                        }
                        className="mt-2 w-full rounded-xl border border-line bg-field px-4 py-3 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    ) : (
                      <input
                        id="profile-age"
                        name="age"
                        type="number"
                        min="13"
                        max="120"
                        step="1"
                        value={profile.age}
                        onChange={updateField}
                        aria-invalid={Boolean(fieldErrors.age)}
                        aria-describedby={
                          fieldErrors.age ? 'profile-age-error' : undefined
                        }
                        className="mt-2 min-h-12 w-full rounded-xl border border-line bg-field px-4 py-3 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    )}
                    {fieldErrors[field.name] && (
                      <p
                        id={`profile-${field.name}-error`}
                        role="alert"
                        className="mt-2 text-xs text-rose-200"
                      >
                        {fieldErrors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {error && (
                <p role="alert" className="mt-5 text-sm text-rose-200">
                  {error}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="min-h-11 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-midnight hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
                >
                  {isSaving ? 'Saving report…' : 'Save Health Report'}
                </button>
                {hasProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsReportView(true)
                      setError('')
                      setFieldErrors({})
                    }}
                    disabled={isSaving}
                    className="min-h-11 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-secondary hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  )
}

export default HealthProfilePage
