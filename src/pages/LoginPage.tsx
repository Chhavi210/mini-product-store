import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { login } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface FormErrors {
  username?: string
  password?: string
  general?: string
}

function validate(username: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (!username.trim()) errors.username = 'Username is required'
  if (!password) errors.password = 'Password is required'
  else if (password.length < 3) errors.password = 'Password must be at least 3 characters'
  return errors
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ username: false, password: false })

  const handleBlur = (field: 'username' | 'password') => {
    setTouched((t) => ({ ...t, [field]: true }))
    const errs = validate(username, password)
    setErrors(errs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ username: true, password: true })

    const errs = validate(username, password)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const data = await login({ username, password })
      setAuth(
        {
          id: data.id,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          image: data.image,
          token: data.accessToken,
          refreshToken: data.refreshToken,
        },
        data.accessToken,
        data.refreshToken,
      )
      toast.success(`Welcome back, ${data.firstName}!`)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 400 || status === 401) {
        setErrors({ general: 'Invalid username or password.' })
      } else {
        setErrors({ general: 'Network error. Please try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sign in to MiniStore
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter your credentials to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          {/* General error */}
          {errors.general && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              {errors.general}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (touched.username) setErrors(validate(e.target.value, password))
              }}
              onBlur={() => handleBlur('username')}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
              placeholder="emilys"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900
                placeholder-slate-400 transition-colors
                focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20
                aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-500/20
                dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500
                dark:focus:border-primary-400"
            />
            {errors.username && touched.username && (
              <p id="username-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (touched.password) setErrors(validate(username, e.target.value))
                }}
                onBlur={() => handleBlur('password')}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900
                  placeholder-slate-400 transition-colors
                  focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20
                  aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-500/20
                  dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500
                  dark:focus:border-primary-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && touched.password && (
              <p id="password-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>

          {/* Test credentials hint */}
          {/* <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
            Test: <code className="font-mono">emilys</code> /{' '}
            <code className="font-mono">emilyspass</code>
          </p> */}
        </form>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            ← Back to store
          </Link>
        </p>
      </div>
    </main>
  )
}
