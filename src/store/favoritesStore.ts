import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FavoritesState } from '@/types'

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},

      addFavorite: (userId: number, productId: number) => {
        const key = String(userId)
        const current = get().favorites[key] ?? []
        if (!current.includes(productId)) {
          set((state) => ({
            favorites: {
              ...state.favorites,
              [key]: [...current, productId],
            },
          }))
        }
      },

      removeFavorite: (userId: number, productId: number) => {
        const key = String(userId)
        const current = get().favorites[key] ?? []
        set((state) => ({
          favorites: {
            ...state.favorites,
            [key]: current.filter((id) => id !== productId),
          },
        }))
      },

      isFavorite: (userId: number, productId: number) => {
        const key = String(userId)
        return (get().favorites[key] ?? []).includes(productId)
      },

      getFavorites: (userId: number) => {
        return get().favorites[String(userId)] ?? []
      },

      clearUserFavorites: (userId: number) => {
        set((state) => ({
          favorites: { ...state.favorites, [String(userId)]: [] },
        }))
      },
    }),
    { name: 'favorites-storage' },
  ),
)
