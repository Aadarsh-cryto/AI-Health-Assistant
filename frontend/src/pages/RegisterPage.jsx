import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthField from '../components/auth/AuthField.jsx'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import { ApiError, postJson } from '../services/api.js'

function RegisterPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [fieldErrors, setFieldErrors] = useState({})

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (password !== confirmPassword) {
      setMessageType('error')
      setFieldErrors({
        confirmPassword: 'The passwords do not match.',
      })
      setMessage('The passwords do not match. Please check them and try again.')
      return
    }

    setIsSubmitting(true)
    setMessage('')
    setFieldErrors({})

    try {
      await postJson('/api/auth/register', {
        name: formData.get('name'),
        email: formData.get('email'),
        password,
      })
      navigate('/login', {
        replace: true,
        state: { notice: 'Account created! Please sign in.' },
      })
    } catch (error) {
      setMessageType('error')

      if (error instanceof ApiError) {
        setFieldErrors(error.errors)
        setMessage(error.message)
      } else {
        setMessage('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const messageClasses =
    messageType === 'error'
      ? 'border-rose-400/30 bg-rose-400/10 text-rose-200'
      : 'border-electric/30 bg-electric/10 text-blue-100'

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      description="Set up your personal health space in a few steps."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-accent underline-offset-4 transition-colors duration-200 hover:text-teal-200 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <AuthField
          id="register-name"
          name="name"
          label="Full name"
          autoComplete="name"
          placeholder="Your full name"
          minLength={2}
          error={fieldErrors.name}
        />
        <AuthField
          id="register-email"
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={fieldErrors.email}
        />
        <AuthField
          id="register-password"
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          error={fieldErrors.password}
        />
        <AuthField
          id="register-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          minLength={8}
          error={fieldErrors.confirmPassword}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full rounded-xl bg-accent px-4 py-3 font-bold text-midnight shadow-lg shadow-accent/10 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-teal-300 hover:shadow-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      {message && (
        <p
          role={messageType === 'error' ? 'alert' : 'status'}
          aria-live={messageType === 'error' ? 'assertive' : 'polite'}
          className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-6 ${messageClasses}`}
        >
          {message}
        </p>
      )}
    </AuthLayout>
  )
}

export default RegisterPage
