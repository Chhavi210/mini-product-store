import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartState, Product } from '@/types'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},

      addToCart: (userId: number, product: Product) => {
        const key = String(userId)
        const cart = get().carts[key] ?? []
        const existing = cart.find((i) => i.product.id === product.id)
        if (existing) {
          set((state) => ({
            carts: {
              ...state.carts,
              [key]: cart.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            },
          }))
        } else {
          set((state) => ({
            carts: {
              ...state.carts,
              [key]: [...cart, { product, quantity: 1 }],
            },
          }))
        }
      },

      removeFromCart: (userId: number, productId: number) => {
        const key = String(userId)
        const cart = get().carts[key] ?? []
        set((state) => ({
          carts: {
            ...state.carts,
            [key]: cart.filter((i) => i.product.id !== productId),
          },
        }))
      },

      updateQuantity: (userId: number, productId: number, quantity: number) => {
        const key = String(userId)
        const cart = get().carts[key] ?? []
        if (quantity <= 0) {
          get().removeFromCart(userId, productId)
          return
        }
        set((state) => ({
          carts: {
            ...state.carts,
            [key]: cart.map((i) =>
              i.product.id === productId ? { ...i, quantity } : i,
            ),
          },
        }))
      },

      getCart: (userId: number) => get().carts[String(userId)] ?? [],

      getCartCount: (userId: number) =>
        (get().carts[String(userId)] ?? []).reduce((sum, i) => sum + i.quantity, 0),

      getCartTotal: (userId: number) =>
        (get().carts[String(userId)] ?? []).reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0,
        ),

      clearUserCart: (userId: number) =>
        set((state) => ({ carts: { ...state.carts, [String(userId)]: [] } })),
    }),
    { name: 'cart-storage' },
  ),
)
