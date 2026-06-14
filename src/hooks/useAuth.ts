import { useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useCartStore } from '@/store/cartStore'
import { getCurrentUser } from '@/api/auth'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, token, setAuth, clearAuth, setLoading, isLoading } = useAuthStore()

  // On mount: if we have a stored token but no user object yet, restore the session
  useEffect(() => {
    if (token && !user) {
      setLoading(true)
      getCurrentUser()
        .then((me) => {
          setAuth(
            { ...me, token, refreshToken: useAuthStore.getState().refreshToken ?? '' },
            token,
            useAuthStore.getState().refreshToken ?? '',
          )
        })
        .catch(() => {
          clearAuth()
        })
        .finally(() => setLoading(false))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const logout = useCallback(() => {
    clearAuth()
    toast.success('Logged out successfully')
  }, [clearAuth])

  const isAuthenticated = !!user && !!token

  return { user, token, isAuthenticated, isLoading, logout }
}

// Keep this separate to avoid coupling logout to favorites/cart
export function useLogout() {
  const { clearAuth, user } = useAuthStore()
  const { clearUserFavorites } = useFavoritesStore()
  const { clearUserCart } = useCartStore()

  return useCallback(() => {
    if (user) {
      // Do NOT clear favorites/cart on logout — they persist across sessions
      // clearUserFavorites(user.id)  // uncomment if strict isolation is preferred
    }
    clearAuth()
    toast.success('Logged out')
  }, [clearAuth, user, clearUserFavorites, clearUserCart])
}
