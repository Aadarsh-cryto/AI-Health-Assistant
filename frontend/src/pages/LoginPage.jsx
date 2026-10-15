import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthField from '../components/auth/AuthField.jsx'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import { ApiError, postJson } from '../services/api.js'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(() => location.state?.notice ?? '')
  const [messageType, setMessageType] = useState(() =>
    location.state?.notice ? 'success' : 'error',
  )
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setMessageType('error')
    setFieldErrors({})

    const formData = new FormData(event.currentTarget)

    try {
      await postJson('/api/auth/login', {
        email: formData.get('email'),
        password: formData.get('password'),
      })
      navigate('/dashboard', {
        replace: true,
        state: { notice: 'Login successful! Welcome back.' },
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.errors)
        setMessageType('error')
        setMessage(
          error.status === 401
            ? 'Email or password is incorrect.'
            : error.message,
        )
      } else {
        setMessageType('error')
        setMessage('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Continue to your personal health space."
      footer={
        <>
          New to Carewise?{' '}
          <Link
            to="/register"
            className="font-semibold text-accent underline-offset-4 transition-colors duration-200 hover:text-teal-200 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <AuthField
          id="login-email"
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={fieldErrors.email}
        />
        <AuthField
          id="login-password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          minLength={8}
          error={fieldErrors.password}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full rounded-xl bg-accent px-4 py-3 font-bold text-midnight shadow-lg shadow-accent/10 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-300 hover:shadow-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {message && (
        <p
          role={messageType === 'success' ? 'status' : 'alert'}
          aria-live={messageType === 'success' ? 'polite' : 'assertive'}
          className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-6 ${
            messageType === 'success'
              ? 'border-accent/30 bg-accent/10 text-teal-100'
              : 'border-rose-400/30 bg-rose-400/10 text-rose-200'
          }`}
        >
          {message}
        </p>
      )}
    </AuthLayout>
  )
}

export default LoginPage
