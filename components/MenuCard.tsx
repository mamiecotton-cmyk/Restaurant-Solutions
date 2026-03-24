'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

interface MenuCardProps {
  id: string
  name: string
  priceRange: string
  price: number
  imageSrc: string
  imageAlt: string
  description: string
}

export default function MenuCard({ id, name, priceRange, price, imageSrc, imageAlt, description }: MenuCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ id, name, price, imageSrc })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    setQuantity(1)
  }

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
      style={{
        background: '#0D1220',
        border: '1px solid rgba(0,212,212,0.15)',
        boxShadow: '0 0 0 rgba(0,212,212,0)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = '1px solid rgba(0,212,212,0.5)'
        e.currentTarget.style.boxShadow = '0 0 25px rgba(0,212,212,0.15), 0 20px 40px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = '1px solid rgba(0,212,212,0.15)'
        e.currentTarget.style.boxShadow = '0 0 0 rgba(0,212,212,0)'
      }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, #0D1220 0%, transparent 60%)'
        }} />
        {/* Neon price badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black"
          style={{
            background: 'rgba(5,8,16,0.85)',
            border: '1px solid rgba(212,175,55,0.5)',
            color: '#D4AF37',
            backdropFilter: 'blur(8px)',
            textShadow: '0 0 8px rgba(212,175,55,0.6)'
          }}>
          {priceRange}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-black uppercase tracking-wide text-white mb-1"
          style={{ fontFamily: 'Georgia, serif' }}>
          {name}
        </h3>
        <p className="text-gray-500 text-xs mb-4 leading-relaxed">{description}</p>

        {/* Quantity */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-xs uppercase tracking-wider">Qty</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-full font-bold text-sm transition-all flex items-center justify-center"
              style={{
                background: 'rgba(0,212,212,0.1)',
                border: '1px solid rgba(0,212,212,0.3)',
                color: '#00D4D4'
              }}
            >−</button>
            <span className="text-white font-black text-base w-4 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-7 h-7 rounded-full font-bold text-sm transition-all flex items-center justify-center"
              style={{
                background: 'rgba(0,212,212,0.1)',
                border: '1px solid rgba(0,212,212,0.3)',
                color: '#00D4D4'
              }}
            >+</button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full font-bold py-3 rounded-xl uppercase tracking-wider text-sm transition-all duration-200 active:scale-95 min-h-[46px]"
          style={added ? {
            backgroundColor: '#00D4D4',
            color: '#050810',
            boxShadow: '0 0 15px rgba(0,212,212,0.5)'
          } : {
            backgroundColor: 'transparent',
            border: '2px solid rgba(0,212,212,0.5)',
            color: '#00D4D4',
          }}
        >
          {added ? '✓ Added!' : 'Add to Order'}
        </button>
      </div>
    </div>
  )
}