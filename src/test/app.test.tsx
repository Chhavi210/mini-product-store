import { describe, it, expect, beforeEach,} from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { PublicOnlyRoute } from '@/router/PublicOnlyRoute'


// ── authStore tests ───────────────────────────────────────────────────────────

describe('authStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({ user: null, token: null, refreshToken: null, isLoading: false })
  })

  it('setAuth stores user, token, and refreshToken', () => {
    const mockUser = {
      id: 1, username: 'emilys', email: 'e@e.com',
      firstName: 'Emily', lastName: 'Smith', gender: 'female',
      image: 'https://example.com/avatar.png',
      token: 'tok', refreshToken: 'rtok',
    }
    useAuthStore.getState().setAuth(mockUser, 'tok', 'rtok')

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe('tok')
    expect(state.refreshToken).toBe('rtok')
  })

  it('clearAuth removes all auth state', () => {
    const mockUser = {
      id: 1, username: 'emilys', email: 'e@e.com',
      firstName: 'Emily', lastName: 'Smith', gender: 'female',
      image: '', token: 'tok', refreshToken: 'rtok',
    }
    useAuthStore.getState().setAuth(mockUser, 'tok', 'rtok')
    useAuthStore.getState().clearAuth()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.refreshToken).toBeNull()
  })

  it('setLoading updates isLoading', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})

// ── ProtectedRoute tests ──────────────────────────────────────────────────────

const ProtectedContent = () => <div>Protected content</div>
const LoginPage = () => <div>Login page</div>

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, refreshToken: null, isLoading: false })
  })

  it('redirects unauthenticated user to /login', async () => {
    render(
      <MemoryRouter initialEntries={['/favorites']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/favorites" element={<ProtectedContent />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument()
    })
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders protected content when authenticated', async () => {
    const mockUser = {
      id: 1, username: 'emilys', email: 'e@e.com',
      firstName: 'Emily', lastName: 'Smith', gender: 'female',
      image: '', token: 'valid-token', refreshToken: 'rtok',
    }
    useAuthStore.setState({ user: mockUser, token: 'valid-token', refreshToken: 'rtok', isLoading: false })

    render(
      <MemoryRouter initialEntries={['/favorites']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/favorites" element={<ProtectedContent />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Protected content')).toBeInTheDocument()
    })
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })
})

// ── PublicOnlyRoute tests ─────────────────────────────────────────────────────

const HomePage = () => <div>Home page</div>
const LoginContent = () => <div>Login content</div>

describe('PublicOnlyRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, refreshToken: null, isLoading: false })
  })

  it('shows login page when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Login content')).toBeInTheDocument()
  })

  it('redirects authenticated user away from /login to home', () => {
    const mockUser = {
      id: 1, username: 'emilys', email: 'e@e.com',
      firstName: 'Emily', lastName: 'Smith', gender: 'female',
      image: '', token: 'tok', refreshToken: 'rtok',
    }
    useAuthStore.setState({ user: mockUser, token: 'tok', refreshToken: 'rtok', isLoading: false })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginContent />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Home page')).toBeInTheDocument()
    expect(screen.queryByText('Login content')).not.toBeInTheDocument()
  })
})

// ── favoritesStore tests ──────────────────────────────────────────────────────

import { useFavoritesStore } from '@/store/favoritesStore'

describe('favoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favorites: {} })
  })

  it('adds and checks a favorite', () => {
    const { addFavorite, isFavorite } = useFavoritesStore.getState()
    expect(isFavorite(1, 42)).toBe(false)
    addFavorite(1, 42)
    expect(isFavorite(1, 42)).toBe(true)
  })

  it('removes a favorite', () => {
    const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore.getState()
    addFavorite(1, 42)
    removeFavorite(1, 42)
    expect(isFavorite(1, 42)).toBe(false)
  })

  it('scopes favorites per user', () => {
    const { addFavorite, isFavorite } = useFavoritesStore.getState()
    addFavorite(1, 42)
    expect(isFavorite(1, 42)).toBe(true)
    expect(isFavorite(2, 42)).toBe(false)
  })

  it('does not duplicate favorites', () => {
    const { addFavorite, getFavorites } = useFavoritesStore.getState()
    addFavorite(1, 42)
    addFavorite(1, 42)
    expect(getFavorites(1)).toHaveLength(1)
  })
})
