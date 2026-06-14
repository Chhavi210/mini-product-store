import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useCartStore } from '@/store/cartStore'
import { getCurrentUser } from '@/api/auth'
import type { AuthUser } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useLogout } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export function ProfilePage() {
  const { user: storedUser, token } = useAuthStore()
  const { getFavorites } = useFavoritesStore()
  const { getCartCount } = useCartStore()
  const logout = useLogout()
  const [freshUser, setFreshUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setIsLoading(true)
    getCurrentUser()
      .then((u) => setFreshUser({ ...u, token: token!, refreshToken: '' }))
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setIsLoading(false))
  }, [token])

  const user = freshUser ?? storedUser
  const favoriteCount = user ? getFavorites(user.id).length : 0
  const cartCount = user ? getCartCount(user.id) : 0

  if (isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </main>
    )
  }

  if (error || !user) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-600 dark:text-slate-300">{error ?? 'User not found'}</p>
        <Button onClick={logout} variant="danger">Log out</Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800 animate-fade-in">
        {/* Avatar + name */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img
            src={user.image}
            alt={`${user.firstName} ${user.lastName}`}
            className="h-24 w-24 rounded-full border-4 border-primary-100 object-cover dark:border-primary-900"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-700">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{favoriteCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Saved products</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-700">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{cartCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Items in cart</p>
          </div>
        </div>

        {/* Info */}
        <dl className="mb-6 space-y-3">
          {[
            ['Email', user.email],
            ['Gender', user.gender],
            ['User ID', String(user.id)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
              <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{value}</dd>
            </div>
          ))}
        </dl>

        <Button variant="danger" className="w-full" onClick={logout}>
          Log out
        </Button>
      </div>
    </main>
  )
}
