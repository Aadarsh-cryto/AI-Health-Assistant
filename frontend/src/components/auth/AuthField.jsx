import { useState } from 'react'

const inputClassName =
  'w-full rounded-xl border border-line bg-field px-4 py-3 text-base text-ink outline-none transition duration-200 placeholder:text-secondary/60 hover:border-secondary/50 focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10 motion-reduce:transition-none'

function AuthField({
  id,
  label,
  name,
  type = 'text',
  autoComplete,
  placeholder,
  required = true,
  minLength,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-ink/90"
      >
        {label}
      </label>
      <div className={isPassword ? 'relative' : undefined}>
        <input
          id={id}
          name={name}
          type={inputType}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClassName}${isPassword ? ' pr-20' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            className="absolute inset-y-0 right-3 my-auto h-10 rounded-lg px-2 text-sm font-semibold text-secondary transition-colors duration-200 hover:bg-accent/10 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm leading-5 text-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}

export default AuthField
