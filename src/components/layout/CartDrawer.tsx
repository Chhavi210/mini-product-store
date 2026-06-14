import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { user } = useAuthStore()
  const { getCart, getCartTotal, updateQuantity, removeFromCart } = useCartStore()
  const drawerRef = useRef<HTMLDivElement>(null)

  const cart = user ? getCart(user.id) : []
  const total = user ? getCartTotal(user.id) : 0

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Trap scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCheckout = () => {
    toast.success('Order placed! (mock)')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/40 transition-opacity',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={clsx(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform dark:bg-slate-900',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-slate-500 dark:text-slate-400">Your cart is empty</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-contain bg-slate-50"
                  />
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">
                      {product.title}
                    </p>
                    <p className="text-sm text-slate-500">${product.price.toFixed(2)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => user && updateQuantity(user.id, product.id, quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300"
                        aria-label="Decrease quantity"
                      >−</button>
                      <span className="min-w-[20px] text-center text-sm font-medium">{quantity}</span>
                      <button
                        onClick={() => user && updateQuantity(user.id, product.id, quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300"
                        aria-label="Increase quantity"
                      >+</button>
                      <button
                        onClick={() => user && removeFromCart(user.id, product.id)}
                        className="ml-auto text-xs text-red-500 hover:underline"
                      >Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
            <div className="mb-4 flex justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">Total</span>
              <span className="font-bold text-slate-900 dark:text-white">${total.toFixed(2)}</span>
            </div>
            <Button className="w-full" onClick={handleCheckout}>
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
