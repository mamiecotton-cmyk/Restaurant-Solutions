'use client'

import { useState } from 'react'

interface OrderButtonProps {
  label?: string
  className?: string
  items?: Array<{ name: string; price: number; quantity: number }>
}

const defaultItems = [
  { name: 'Crispy Catfish', price: 2000, quantity: 1 },
  { name: 'Soul Wings', price: 1700, quantity: 1 },
]

export default function OrderButton({
  label = 'Order Now',
  className = '',
  items = defaultItems,
}: OrderButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`bg-[#D4AF37] text-black font-black uppercase tracking-wider rounded-full transition-all duration-200 hover:bg-yellow-400 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed min-h-[56px] ${className}`}
    >
      {loading ? 'Loading...' : label}
    </button>
  )
}
