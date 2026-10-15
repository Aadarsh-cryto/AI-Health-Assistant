import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../services/api.js'
import {
  deleteHealthHistoryRecord,
  getHealthHistory,
  getHealthHistoryRecord,
  getHistoryViewState,
} from '../services/healthRecords.js'

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
}

function HistoryRecordDetails({ record }) {
  return (
    <>
      <p className="mt-1 text-xs text-secondary">
        Saved {formatDate(record.analyzedAt)}
      </p>
      <p className="mt-4 text-sm leading-6 text-secondary">
        {record.symptomSummary}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          ['Possible explanations · not a diagnosis', record.analysis?.possibleExplanations],
          ['General self-care information', record.analysis?.selfCare],
          ['Warning signs', record.analysis?.warningSigns],
        ].map(([title, items]) => (
          <section
            key={title}
            className="rounded-xl border border-line/70 bg-midnight/30 p-4"
          >
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            {Array.isArray(items) && items.length > 0 ? (
              <ul className="mt-3 space-y-2 text-xs leading-5 text-secondary">
                {items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-secondary">No items recorded.</p>
            )}
          </section>
        ))}
        <section className="rounded-xl border border-line/70 bg-midnight/30 p-4">
          <h3 className="text-sm font-semibold text-ink">Recommended next step</h3>
          <p className="mt-3 text-xs leading-5 text-secondary">
            {record.analysis?.recommendedNextStep}
          </p>
        </section>
      </div>
      {record.analysis?.recommendedSpecialties?.length > 0 && (
        <p className="mt-4 text-xs text-secondary">
          Suggested care categories:{' '}
          {record.analysis.recommendedSpecialties.join(', ')}
        </p>
      )}
      <p className="mt-4 rounded-xl border border-line/70 bg-midnight/30 p-4 text-xs leading-5 text-secondary">
        {record.analysis?.disclaimer} Saved AI-generated information may be
        incomplete or incorrect. This record is not a verified diagnosis or
        medical advice.
      </p>
    </>
  )
}

function HealthHistoryPage() {
  const { recordId } = useParams()
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [record, setRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadHistory = useCallback(async () => {
    try {
      if (recordId) {
        const response = await getHealthHistoryRecord(recordId)
        setRecord(response.record)
      } else {
        const response = await getHealthHistory()
        setRecords(Array.isArray(response.records) ? response.records : [])
      }
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        navigate('/login', {
          replace: true,
          state: { notice: 'Please sign in to view your Health History.' },
        })
        return
      }
      setError(requestError.message || 'Could not load Health History.')
    } finally {
      setIsLoading(false)
    }
  }, [navigate, recordId])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsLoading(true)
      setError('')
      loadHistory()
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [attempt, loadHistory])

  async function handleDelete() {
    if (!recordId || !window.confirm('Delete this health history record?')) {
      return
    }
    setIsDeleting(true)
    setError('')
    try {
      await deleteHealthHistoryRecord(recordId)
      navigate('/health-history', { replace: true })
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        navigate('/login', {
          replace: true,
          state: { notice: 'Please sign in to manage your Health History.' },
        })
        return
      }
      setError(requestError.message || 'Could not delete this record.')
    } finally {
      setIsDeleting(false)
    }
  }

  const viewState = getHistoryViewState({ isLoading, error, records })

  return (
    <main className="min-h-screen bg-midnight px-4 py-6 text-ink sm:px-7 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/dashboard"
          className="inline-flex min-h-10 items-center rounded-lg text-sm font-medium text-secondary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          ← Back to dashboard
        </Link>
        <header className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-electric">
            Your saved records
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Health History
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            Only analysis results you explicitly consented to save appear here.
            AI-generated records are general information, not verified diagnoses.
          </p>
        </header>

        {isLoading && (
          <p role="status" aria-live="polite" className="mt-7 text-sm text-secondary">
            Loading your Health History…
          </p>
        )}
        {!isLoading && error && (
          <section className="mt-7 rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] p-5">
            <p role="alert" className="text-sm text-rose-200">{error}</p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="mt-4 min-h-10 rounded-lg border border-rose-200/30 px-4 py-2 text-sm font-semibold text-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
            >
              Retry
            </button>
          </section>
        )}

        {!recordId && !error && !isLoading && viewState === 'empty' && (
          <section className="mt-7 rounded-2xl border border-dashed border-line bg-card/60 p-6">
            <h2 className="font-display text-lg font-semibold">
              No history available
            </h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              When you explicitly choose to save a successful non-emergency
              symptom analysis, it will appear here.
            </p>
            <Link
              to="/symptom-checker"
              className="mt-4 inline-flex min-h-10 items-center rounded-lg text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Go to symptom checker
            </Link>
          </section>
        )}

        {!recordId && !error && !isLoading && viewState === 'success' && (
          <ul className="mt-7 space-y-3">
            {records.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/health-history/${encodeURIComponent(item.id)}`}
                  className="block rounded-2xl border border-line/80 bg-card/80 p-5 transition-colors hover:border-electric/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
                >
                  <p className="text-xs font-medium text-electric">
                    {formatDate(item.analyzedAt)}
                  </p>
                  <h2 className="mt-2 font-display text-base font-semibold text-ink">
                    {item.symptomSummary}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-secondary">
                    {item.analysis?.recommendedNextStep}
                  </p>
                  <span className="mt-3 inline-block text-xs font-semibold text-accent">
                    View saved analysis →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {recordId && !isLoading && !error && record && (
          <article className="mt-7 rounded-3xl border border-line/80 bg-card/80 p-5 sm:p-7">
            <h2 className="font-display text-xl font-semibold">
              Saved symptom analysis
            </h2>
            <HistoryRecordDetails record={record} />
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="min-h-10 rounded-xl border border-rose-300/30 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200 disabled:opacity-60"
              >
                {isDeleting ? 'Deleting…' : 'Delete record'}
              </button>
              <Link
                to="/health-history"
                className="inline-flex min-h-10 items-center rounded-xl border border-line px-4 py-2 text-sm font-semibold text-secondary hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                All history
              </Link>
            </div>
          </article>
        )}
      </div>
    </main>
  )
}

export default HealthHistoryPage
