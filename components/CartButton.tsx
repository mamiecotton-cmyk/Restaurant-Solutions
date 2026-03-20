'use client'

import { useCart } from '@/context/CartContext'

export default function CartButton() {
  const { toggleCart, totalItems, totalPrice } = useCart()

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 hover:border-[#D4AF37]/40 text-white rounded-full px-4 py-2 transition-all duration-200 active:scale-95 min-h-[44px]"
      aria-label={`Open cart, ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
    >
      {/* Cart icon */}
      <svg
        className="w-5 h-5 text-[#D4AF37]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>

      {/* Item count badge */}
      {totalItems > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#8B0000] text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center leading-none">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}

      {/* Total price label */}
      {totalItems > 0 ? (
        <span className="text-sm font-bold text-[#D4AF37]">
          ${(totalPrice / 100).toFixed(2)}
        </span>
      ) : (
        <span className="text-sm font-bold text-gray-400">Order</span>
      )}
    </button>
  )
}
