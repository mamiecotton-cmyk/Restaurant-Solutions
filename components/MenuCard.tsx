'use client'

import Image from 'next/image'

interface MenuCardProps {
  name: string
  priceRange: string
  imageSrc: string
  imageAlt: string
  onOrder: () => void
  soldOut?: boolean
}

export default function MenuCard({ name, priceRange, imageSrc, imageAlt, onOrder, soldOut = false }: MenuCardProps) {
  return (
    <div className={`group bg-[#111111] rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 ${
      soldOut
        ? 'grayscale cursor-not-allowed'
        : 'hover:border-[#D4AF37]/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-900/20'
    }`}>
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className={`object-cover transition-transform duration-500 ${soldOut ? '' : 'group-hover:scale-105'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-black text-white uppercase tracking-wide mb-1">{name}</h3>
        <p className="text-[#D4AF37] font-bold text-lg mb-4">{priceRange}</p>
        <button
          onClick={onOrder}
          disabled={soldOut}
          className={`w-full font-bold py-3 rounded-xl uppercase tracking-wider text-sm transition-colors duration-200 active:scale-95 min-h-[48px] ${
            soldOut
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-[#8B0000] hover:bg-red-800 text-white'
          }`}
        >
          {soldOut ? 'Sold Out' : 'Add to Order'}
        </button>
      </div>
    </div>
  )
}