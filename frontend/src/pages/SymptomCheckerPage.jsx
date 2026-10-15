import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, getJson, postJson } from '../services/api.js'
import {
  buildHistoryRecordPayload,
  saveHealthHistoryRecord,
} from '../services/healthRecords.js'
import { getSymptomAnalysisErrorMessage } from '../services/symptomErrors.js'
import { getDoctorNavigationState } from '../services/doctorSpecialty.js'

const INITIAL_FORM = {
  symptoms: '',
  duration: '',
  severity: 'mild',
  additionalContext: '',
}

function SectionIcon({ type }) {
  const paths = {
    possibilities: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 11v5m0-8h.01" />
      </>
    ),
    care: (
      <>
        <path d="M12 21s-8-4.4-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.6-8 11-8 11Z" />
        <path d="M8.5 12h2l1.2-2.5 1.8 5 1.2-2.5h1.3" />
      </>
    ),
    warning: (
      <>
        <path d="m12 3 9 17H3L12 3Z" />
        <path d="M12 9v4m0 3h.01" />
      </>
    ),
    next: (
      <>
        <path d="M4 12h15m-6-6 6 6-6 6" />
      </>
    ),
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
      className="size-5"
    >
      {paths[type]}
    </svg>
  )
}

function ResultSection({ title, type, items, accent, children, action }) {
  return (
    <section className="rounded-2xl border border-line/80 bg-card/80 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className={`flex items-center gap-3 ${accent}`}>
          <SectionIcon type={type} />
          <h2 className="font-display text-base font-semibold text-ink">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
      {items?.length > 0 && (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-sm leading-6 text-secondary"
            >
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {items?.length === 0 && (
        <p className="mt-4 text-sm leading-6 text-secondary">
          No specific general self-care information is suggested for this
          description.
        </p>
      )}
    </section>
  )
}

function SymptomCheckerPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [sessionError, setSessionError] = useState('')
  const [result, setResult] = useState(null)
  const [historyReceipt, setHistoryReceipt] = useState('')
  const [historyConsent, setHistoryConsent] = useState(false)
  const [isSavingHistory, setIsSavingHistory] = useState(false)
  const [historySaveMessage, setHistorySaveMessage] = useState('')
  const [historySaveError, setHistorySaveError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionAttempt, setSessionAttempt] = useState(0)

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
            state: { notice: 'Please sign in to use the symptom checker.' },
          })
          return
        }
        setSessionError(
          requestError.message || 'Could not verify your session.',
        )
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [navigate, sessionAttempt])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const symptoms = form.symptoms.trim()
    const errors = {}
    if (symptoms.length < 3) {
      errors.symptoms = 'Describe your symptoms in at least 3 characters.'
    } else if (symptoms.length > 2000) {
      errors.symptoms = 'Keep your description to 2,000 characters or fewer.'
    }
    if (form.duration.trim().length > 120) {
      errors.duration = 'Keep the duration to 120 characters or fewer.'
    }
    if (form.additionalContext.trim().length > 1000) {
      errors.additionalContext =
        'Keep additional context to 1,000 characters or fewer.'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Review the highlighted fields and try again.')
      return
    }

    setFieldErrors({})
    setError('')
    setIsSubmitting(true)
    try {
      const response = await postJson(
        '/api/symptoms/analyze',
        {
          ...form,
          symptoms,
          duration: form.duration.trim(),
          additionalContext: form.additionalContext.trim(),
        },
        { timeoutMs: 75_000 },
      )
      if (!response?.result) {
        throw new Error('The server returned an incomplete analysis.')
      }
      setResult(response.result)
      setHistoryReceipt(
        typeof response.historyReceipt === 'string'
          ? response.historyReceipt
          : '',
      )
      setHistoryConsent(false)
      setHistorySaveMessage('')
      setHistorySaveError('')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        navigate('/login', {
          replace: true,
          state: { notice: 'Please sign in to use the symptom checker.' },
        })
        return
      }
      setFieldErrors(requestError.errors ?? {})
      setError(getSymptomAnalysisErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  function analyzeAnotherSet() {
    setForm(INITIAL_FORM)
    setFieldErrors({})
    setError('')
    setResult(null)
    setHistoryReceipt('')
    setHistoryConsent(false)
    setHistorySaveMessage('')
    setHistorySaveError('')
  }

  async function saveAnalysisToHistory() {
    if (!result || result.emergency || !historyConsent || !historyReceipt) {
      return
    }
    setIsSavingHistory(true)
    setHistorySaveError('')
    setHistorySaveMessage('')
    try {
      const recordPayload = buildHistoryRecordPayload({
        consent: historyConsent,
        receipt: historyReceipt,
        analysis: result,
      })
      await saveHealthHistoryRecord(recordPayload)
      setHistorySaveMessage('This analysis was saved to your Health History.')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        navigate('/login', {
          replace: true,
          state: { notice: 'Please sign in to save this analysis.' },
        })
        return
      }
      setHistorySaveError(
        requestError.message || 'Could not save this analysis.',
      )
    } finally {
      setIsSavingHistory(false)
    }
  }

  function retrySessionCheck() {
    setError('')
    setSessionError('')
    setIsLoading(true)
    setSessionAttempt((attempt) => attempt + 1)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight px-4">
        <p role="status" aria-live="polite" className="text-sm text-secondary">
          Checking your session…
        </p>
      </main>
    )
  }

  if (sessionError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-midnight px-4">
        <section className="w-full max-w-md rounded-2xl border border-line bg-card p-6">
          <h1 className="font-display text-lg font-semibold">
            Symptom checker unavailable
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
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M19 12H5m6 7-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        <header className="mt-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Informational support
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Symptom Checker
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary sm:text-base sm:leading-7">
            Describe what you’re experiencing to receive general health
            information and guidance on possible next steps. This is not a
            diagnosis.
          </p>
        </header>

        <div
          role="note"
          className="mt-6 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-4 text-sm leading-6 text-amber-100"
        >
          <SectionIcon type="warning" />
          <p>
            If symptoms may be life-threatening—such as chest pain, difficulty
            breathing, stroke signs, severe bleeding, or loss of
            consciousness—contact local emergency services or go to an
            emergency department now. Do not wait for AI analysis.
          </p>
        </div>

        {!result ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.38fr]">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-3xl border border-line/80 bg-card/80 p-5 sm:p-7"
            >
              {error && (
                <p
                  role="alert"
                  className="mb-5 rounded-xl border border-rose-300/20 bg-rose-300/[0.07] px-4 py-3 text-sm leading-5 text-rose-200"
                >
                  {error}
                </p>
              )}

              <div>
                <label
                  htmlFor="symptoms"
                  className="block text-sm font-semibold text-ink"
                >
                  What symptoms are you experiencing?{' '}
                  <span className="text-rose-300" aria-hidden="true">
                    *
                  </span>
                </label>
                <p id="symptoms-hint" className="mt-1 text-xs text-secondary">
                  Share when they occur and what they feel like. Do not include
                  names, addresses, or other identifying details.
                </p>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  required
                  minLength={3}
                  maxLength={2000}
                  rows={6}
                  value={form.symptoms}
                  onChange={updateField}
                  aria-invalid={Boolean(fieldErrors.symptoms)}
                  aria-describedby={
                    fieldErrors.symptoms
                      ? 'symptoms-hint symptoms-error'
                      : 'symptoms-hint'
                  }
                  placeholder="For example, describe what you feel, where you feel it, and when it began."
                  className="mt-3 w-full resize-y rounded-xl border border-line bg-field px-4 py-3 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-secondary/60 hover:border-secondary/40 focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10"
                />
                {fieldErrors.symptoms && (
                  <p
                    id="symptoms-error"
                    className="mt-2 text-xs text-rose-200"
                  >
                    {fieldErrors.symptoms}
                  </p>
                )}
                <p className="mt-1 text-right text-[11px] text-secondary">
                  {form.symptoms.length}/2,000
                </p>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-semibold text-ink"
                  >
                    Duration
                  </label>
                  <input
                    id="duration"
                    name="duration"
                    maxLength={120}
                    value={form.duration}
                    onChange={updateField}
                    aria-invalid={Boolean(fieldErrors.duration)}
                    aria-describedby={
                      fieldErrors.duration ? 'duration-error' : undefined
                    }
                    placeholder="When did it start?"
                    className="mt-2 min-h-11 w-full rounded-xl border border-line bg-field px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-secondary/60 hover:border-secondary/40 focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10"
                  />
                  {fieldErrors.duration && (
                    <p
                      id="duration-error"
                      className="mt-2 text-xs text-rose-200"
                    >
                      {fieldErrors.duration}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="severity"
                    className="block text-sm font-semibold text-ink"
                  >
                    Severity
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={form.severity}
                    onChange={updateField}
                    aria-invalid={Boolean(fieldErrors.severity)}
                    aria-describedby={
                      fieldErrors.severity ? 'severity-error' : undefined
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-line bg-field px-3.5 text-sm text-ink outline-none transition-colors hover:border-secondary/40 focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  {fieldErrors.severity && (
                    <p
                      id="severity-error"
                      className="mt-2 text-xs text-rose-200"
                    >
                      {fieldErrors.severity}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="additionalContext"
                  className="block text-sm font-semibold text-ink"
                >
                  Additional context{' '}
                  <span className="font-normal text-secondary">(optional)</span>
                </label>
                <textarea
                  id="additionalContext"
                  name="additionalContext"
                  maxLength={1000}
                  rows={3}
                  value={form.additionalContext}
                  onChange={updateField}
                  aria-invalid={Boolean(fieldErrors.additionalContext)}
                  aria-describedby={
                    fieldErrors.additionalContext
                      ? 'context-error'
                      : undefined
                  }
                  placeholder="Anything else relevant? Please avoid identifying information."
                  className="mt-2 w-full resize-y rounded-xl border border-line bg-field px-4 py-3 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-secondary/60 hover:border-secondary/40 focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10"
                />
                {fieldErrors.additionalContext && (
                  <p id="context-error" className="mt-2 text-xs text-rose-200">
                    {fieldErrors.additionalContext}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-midnight shadow-lg shadow-accent/10 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none sm:w-auto"
              >
                {isSubmitting && (
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-midnight/30 border-t-midnight motion-reduce:animate-none"
                  />
                )}
                {isSubmitting ? 'Analyzing…' : 'Analyze My Symptoms'}
              </button>
            </form>

            <aside className="h-fit rounded-3xl border border-electric/15 bg-gradient-to-br from-electric/[0.08] to-accent/[0.04] p-5 sm:p-6">
              <h2 className="font-display text-base font-semibold">
                A few important notes
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-secondary">
                <li>
                  This tool shares general information, not a confirmed
                  diagnosis.
                </li>
                <li>
                  AI responses can be incomplete or incorrect. Confirm health
                  concerns with a qualified professional.
                </li>
                <li>
                  Non-emergency submissions are sent to Google Gemini for
                  analysis. This feature does not save them as health records.
                </li>
                <li>
                  Avoid names, addresses, contact details, or other identifying
                  information.
                </li>
              </ul>
            </aside>
          </div>
        ) : (
          <section aria-labelledby="analysis-heading" className="mt-6">
            {result.emergency && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-rose-300/35 bg-rose-300/10 p-5 text-rose-100"
              >
                <h2 className="font-display text-lg font-bold">
                  Emergency care may be needed
                </h2>
                <p className="mt-2 text-sm leading-6">
                  Contact local emergency services or go to the nearest
                  emergency department now. Do not wait for or rely on an AI
                  analysis.
                </p>
              </div>
            )}
            <div className="rounded-3xl border border-line/80 bg-gradient-to-r from-[#132238] to-card p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                General information
              </p>
              <h2
                id="analysis-heading"
                className="mt-2 font-display text-2xl font-bold"
              >
                Symptom overview
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-secondary">
                {result.summary}
              </p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <ResultSection
                title="Possible explanations · not a diagnosis"
                type="possibilities"
                items={result.possibleExplanations}
                accent="text-electric"
              />
              <ResultSection
                title="General self-care information"
                type="care"
                items={result.selfCare}
                accent="text-accent"
              />
              <ResultSection
                title="Warning signs"
                type="warning"
                items={result.warningSigns}
                accent="text-amber-200"
              />
              <ResultSection
                title="Recommended next step"
                type="next"
                accent="text-electric"
                action={
                  !result.emergency && (
                    <Link
                      to="/doctors"
                      state={getDoctorNavigationState(result)}
                      aria-label="Find a doctor"
                      title="Find a doctor"
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-electric/20 bg-electric/[0.06] text-electric transition-colors hover:border-electric/40 hover:bg-electric/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5"
                      >
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    </Link>
                  )
                }
              >
                <p className="mt-4 text-sm leading-6 text-secondary">
                  {result.recommendedNextStep}
                </p>
              </ResultSection>
            </div>

            <p className="mt-4 rounded-xl border border-line/80 bg-card/50 p-4 text-xs leading-5 text-secondary">
              {result.disclaimer} AI output can be incomplete or incorrect and
              does not replace advice from a qualified healthcare professional.
            </p>

            {!result.emergency && (
              <section className="mt-5 rounded-2xl border border-line/80 bg-card/60 p-4 sm:p-5">
                <h2 className="font-display text-sm font-semibold text-ink">
                  Save this result?
                </h2>
                <p className="mt-2 text-xs leading-5 text-secondary">
                  Your analysis and its short summary will be stored with your
                  account in Health History. The original symptom description
                  is not saved by this action. This is optional; only continue
                  if you consent.
                </p>
                <label className="mt-4 flex items-start gap-3 text-sm leading-5 text-ink">
                  <input
                    type="checkbox"
                    checked={historyConsent}
                    disabled={Boolean(historySaveMessage) || isSavingHistory}
                    onChange={(event) => {
                      setHistoryConsent(event.target.checked)
                      setHistorySaveError('')
                    }}
                    className="mt-1 size-4 shrink-0 accent-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  />
                  <span>I consent to save this analysis to my account.</span>
                </label>
                <button
                  type="button"
                  onClick={saveAnalysisToHistory}
                  disabled={
                    !historyConsent ||
                    isSavingHistory ||
                    Boolean(historySaveMessage)
                  }
                  className="mt-4 min-h-10 rounded-xl border border-accent/25 px-4 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingHistory
                    ? 'Saving…'
                    : historySaveMessage
                      ? 'Saved'
                      : 'Save to Health History'}
                </button>
                {historySaveMessage && (
                  <p role="status" className="mt-3 text-xs text-accent">
                    {historySaveMessage}
                  </p>
                )}
                {historySaveError && (
                  <div role="alert" className="mt-3 text-xs text-rose-200">
                    <p>{historySaveError}</p>
                    <button
                      type="button"
                      onClick={saveAnalysisToHistory}
                      disabled={!historyConsent || isSavingHistory}
                      className="mt-2 min-h-9 rounded-lg border border-rose-200/30 px-3 py-1.5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200 disabled:opacity-50"
                    >
                      Retry save
                    </button>
                  </div>
                )}
              </section>
            )}

            <button
              type="button"
              onClick={analyzeAnotherSet}
              className="mt-5 min-h-11 rounded-xl border border-accent/25 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Analyze another set of symptoms
            </button>
          </section>
        )}
      </div>
    </main>
  )
}

export default SymptomCheckerPage
