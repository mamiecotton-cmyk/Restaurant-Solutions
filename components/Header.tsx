'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { itemCount, setIsOpen } = useCart()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}
        style={{
          background: scrolled ? 'rgba(5,8,16,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,212,212,0.15)' : 'none'
        }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3">
            <Image
              src="/Wallys_Logo.jpg"
              alt="Wally's NW Soul"
              width={42}
              height={42}
              className="rounded-full"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,212,0.7))' }}
            />
            <div className="text-left hidden sm:block">
              <span className="block font-black text-sm uppercase" style={{
                color: '#00D4D4',
                textShadow: '0 0 8px rgba(0,212,212,0.6)',
                fontFamily: 'Georgia, serif'
              }}>Wally&apos;s</span>
              <span className="block text-white text-xs uppercase tracking-[0.2em] font-semibold opacity-70">NW Soul</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['menu', 'story', 'catering'].map(id => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-gray-400 text-sm uppercase tracking-widest font-bold transition-all duration-200 hover:text-[#00D4D4]"
              >
                {id === 'menu' ? 'Menu' : id === 'story' ? 'Our Story' : 'Catering'}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button onClick={() => setIsOpen(true)} className="relative p-2 text-gray-400 hover:text-[#00D4D4] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[#050810] text-xs font-black rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: '#00D4D4', boxShadow: '0 0 8px rgba(0,212,212,0.8)' }}>
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
            >
              <span className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : 'bg-white'}`}
                style={{ backgroundColor: menuOpen ? '#00D4D4' : 'white' }} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : 'bg-white'}`}
                style={{ backgroundColor: menuOpen ? '#00D4D4' : 'white' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-20 flex flex-col items-center justify-center transition-all duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(5,8,16,0.98)' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(0,212,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,212,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10 flex flex-col items-center gap-8">
          <Image src="/Wallys_Logo.jpg" alt="Logo" width={90} height={90} className="rounded-full mb-2"
            style={{ filter: 'drop-shadow(0 0 20px rgba(0,212,212,0.7))' }} />
          {['menu', 'story', 'catering'].map(id => (
            <button key={id} onClick={() => scrollTo(id)}
              className="text-3xl font-black uppercase tracking-wide"
              style={{ color: '#00D4D4', textShadow: '0 0 15px rgba(0,212,212,0.6)', fontFamily: 'Georgia, serif' }}>
              {id === 'menu' ? 'Menu' : id === 'story' ? 'Our Story' : 'Catering'}
            </button>
          ))}
          <button
            onClick={() => { setMenuOpen(false); setIsOpen(true) }}
            className="mt-4 font-black text-lg px-10 py-4 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: '#D4AF37', color: '#050810', boxShadow: '0 0 20px rgba(212,175,55,0.5)' }}>
            🛒 Cart {itemCount > 0 && `(${itemCount})`}
          </button>
        </div>
        <p className="absolute bottom-8 text-xs uppercase tracking-widest text-gray-600">Northwest Soul. Real Flavor.</p>
      </div>
    </>
  )
}