'use client'

import Image from 'next/image'

interface MenuCardProps {
  name: string
  priceRange: string
  imageSrc: string
  imageAlt: string
  onOrder: () => void
}

export default function MenuCard({ name, priceRange, imageSrc, imageAlt, onOrder }: MenuCardProps) {
  return (
    <div className="group bg-[#111111] rounded-2xl overflow-hidden border border-white/5 hover:border-[#D4AF37]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-900/20">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-black text-white uppercase tracking-wide mb-1">{name}</h3>
        <p className="text-[#D4AF37] font-bold text-lg mb-4">{priceRange}</p>
        <button
          onClick={onOrder}
          className="w-full bg-[#8B0000] hover:bg-red-800 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-sm transition-colors duration-200 active:scale-95 min-h-[48px]"
        >
          Add to Order
        </button>
      </div>
    </div>
  )
}
