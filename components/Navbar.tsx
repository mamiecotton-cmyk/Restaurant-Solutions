'use client'

import { useState, useEffect } from 'react'
import CartButton from '@/components/CartButton'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => scrollTo('hero')}
          className="text-left group"
          aria-label="Scroll to top"
        >
          <span className="text-[#D4AF37] font-black text-xl uppercase tracking-tight leading-none group-hover:text-yellow-300 transition-colors">
            Wally&apos;s
          </span>
          <br />
          <span className="text-white font-black text-xs uppercase tracking-[0.25em] group-hover:text-gray-300 transition-colors">
            NW Soul
          </span>
        </button>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6">
          <button
            onClick={() => scrollTo('menu')}
            className="text-gray-300 hover:text-[#D4AF37] text-sm font-bold uppercase tracking-widest transition-colors"
          >
            Menu
          </button>
          <button
            onClick={() => scrollTo('story')}
            className="text-gray-300 hover:text-[#D4AF37] text-sm font-bold uppercase tracking-widest transition-colors"
          >
            Our Story
          </button>
        </div>

        {/* Cart button */}
        <CartButton />
      </div>
    </nav>
  )
}
