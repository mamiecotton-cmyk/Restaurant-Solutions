'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (items.length === 0) return
    setLoading(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      })
      if (!res.ok) {
        throw new Error(`Checkout failed (${res.status})`)
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error(err)
      setCheckoutError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#111111] border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-xl font-black text-white uppercase tracking-wide">
            Your Order{' '}
            {totalItems > 0 && (
              <span className="text-[#D4AF37]">({totalItems})</span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {items.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🍽️</span>
              <p className="text-gray-400 text-lg">Your order is empty</p>
              <p className="text-gray-600 text-sm mt-2">Add some soul food to get started!</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-[#1a1a1a] rounded-xl p-3 border border-white/5"
                >
                  {/* Item Image */}
                  {item.image && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wide truncate">
                      {item.name}
                    </h3>
                    <p className="text-[#D4AF37] font-bold text-sm mt-1">
                      ${(item.price / 100).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-[#222] border border-white/10 text-white flex items-center justify-center hover:border-[#D4AF37] transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="text-white font-bold text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-[#222] border border-white/10 text-white flex items-center justify-center hover:border-[#D4AF37] transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <p className="text-white font-bold text-sm">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="text-gray-600 hover:text-red-400 text-xs uppercase tracking-wider transition-colors"
              >
                Clear Order
              </button>
            </>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/10 bg-[#111111]">
            {checkoutError && (
              <p className="text-red-400 text-sm text-center mb-3">{checkoutError}</p>
            )}
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 uppercase tracking-wider text-sm">Total</span>
              <span className="text-2xl font-black text-[#D4AF37]">
                ${(totalPrice / 100).toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black font-black text-lg py-4 rounded-full uppercase tracking-wider hover:bg-yellow-400 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting...' : '💳 Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
