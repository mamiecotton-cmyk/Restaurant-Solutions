'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Hero() {
  const [loading, setLoading] = useState(false)

  const handleOrder = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { name: "Catfish Po'Boy", price: 1650, quantity: 1 },
            { name: 'Garlic Butter Wings', price: 1700, quantity: 1 },
          ],
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: '#050810' }}>
      {/* Neon grid */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 212, 212, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 212, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }} />

      {/* Glow orb */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full" style={{
          background: 'radial-gradient(circle, rgba(0,212,212,0.15) 0%, rgba(212,175,55,0.08) 40%, transparent 70%)',
          filter: 'blur(60px)'
        }} />
      </div>

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=1600&q=80"
          alt="Soul food"
          fill
          className="object-cover object-center"
          style={{ opacity: 0.08 }}
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-28 pb-16">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(0,212,212,0.4) 0%, transparent 70%)',
              filter: 'blur(20px)',
              transform: 'scale(1.3)'
            }} />
            <Image
              src="/Wallys_Logo.jpg"
              alt="Wally's NW Soul Experience"
              width={320}
              height={320}
              className="rounded-full relative z-10"
              style={{ filter: 'drop-shadow(0 0 30px rgba(0,212,212,0.8)) drop-shadow(0 0 60px rgba(0,212,212,0.4))' }}
              priority
            />
          </div>
        </div>

        {/* Name */}
        <h1 className="font-black uppercase leading-none mb-6" style={{ fontFamily: 'Georgia, serif' }}>
          <span className="block text-7xl md:text-9xl" style={{
            color: '#00D4D4',
            textShadow: '0 0 10px #00D4D4, 0 0 25px #00D4D4, 0 0 60px rgba(0,212,212,0.4)',
            letterSpacing: '-0.02em'
          }}>
            Wally&apos;s
          </span>
          <span className="block text-3xl md:text-5xl text-white mt-2" style={{
            letterSpacing: '0.2em',
            textShadow: '0 0 15px rgba(255,255,255,0.2)'
          }}>
            NW SOUL
          </span>
          <span className="block text-base md:text-lg mt-3 font-bold tracking-[0.5em]" style={{
            color: '#D4AF37',
            textShadow: '0 0 10px rgba(212,175,55,0.8)'
          }}>
            EXPERIENCE
          </span>
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-24" style={{ background: 'linear-gradient(to right, transparent, #00D4D4)' }} />
          <span className="text-xs font-bold tracking-[0.4em] uppercase" style={{
            color: '#D4AF37',
            textShadow: '0 0 8px rgba(212,175,55,0.6)'
          }}>Est. 2011 · Seattle, WA</span>
          <div className="h-px w-24" style={{ background: 'linear-gradient(to left, transparent, #00D4D4)' }} />
        </div>

        {/* Tagline */}
        <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
          Southern Soul Food — Reimagined for the Pacific Northwest
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={scrollToMenu}
            disabled={loading}
            className="w-full sm:w-auto font-black text-lg px-12 py-5 rounded-full uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-60 min-h-[56px]"
            style={{
              backgroundColor: '#00D4D4',
              color: '#050810',
              boxShadow: '0 0 25px rgba(0,212,212,0.7), 0 0 50px rgba(0,212,212,0.3)',
            }}
          >
            🍽️ Order Now
          </button>
          <a
            href="tel:2066933335"
            className="w-full sm:w-auto font-bold text-lg px-12 py-5 rounded-full uppercase tracking-wider transition-all duration-200 active:scale-95 min-h-[56px] flex items-center justify-center border-2"
            style={{
              borderColor: '#D4AF37',
              color: '#D4AF37',
              boxShadow: '0 0 15px rgba(212,175,55,0.3)'
            }}
          >
            📞 (206) 693-3335
          </a>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            '📍 2218 S Jackson St, Seattle',
            '🕐 Tue–Sat 12–8pm · Sun 12–6pm',
            '🎉 Catering Available',
          ].map(item => (
            <div key={item} className="px-4 py-2 rounded-full text-sm text-gray-400" style={{
              border: '1px solid rgba(0,212,212,0.2)',
              background: 'rgba(0,212,212,0.05)',
              backdropFilter: 'blur(8px)'
            }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"
          style={{ stroke: '#00D4D4', filter: 'drop-shadow(0 0 4px #00D4D4)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}