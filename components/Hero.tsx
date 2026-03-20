'use client'

import Image from 'next/image'

export default function Hero() {
  const scrollToMenu = () => {
    const menu = document.getElementById('menu')
    menu?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=1600&q=80"
          alt="Soul food background"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#0a0a0a]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
        {/* Badge */}
        <div className="inline-block bg-[#8B0000] text-white text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6">
          🍗 Now Accepting Direct Orders
        </div>

        {/* Restaurant Name */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none mb-4">
          <span className="text-[#D4AF37]">Wally&apos;s</span>
          <br />
          <span className="text-white">NW Soul</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-300 font-light tracking-widest uppercase mb-3">
          Northwest Soul. Real Flavor.
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 my-8">
          <div className="h-px w-24 bg-[#D4AF37]/50" />
          <span className="text-[#D4AF37] text-xl">✦</span>
          <div className="h-px w-24 bg-[#D4AF37]/50" />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={scrollToMenu}
            className="w-full sm:w-auto bg-[#D4AF37] text-black font-black text-lg px-12 py-5 rounded-full uppercase tracking-wider hover:bg-yellow-400 active:scale-95 transition-all duration-200 shadow-lg shadow-yellow-900/40 min-h-[56px]"
          >
            🛒 Order Now
          </button>
          <button
            onClick={scrollToMenu}
            className="w-full sm:w-auto border-2 border-white text-white font-bold text-lg px-12 py-5 rounded-full uppercase tracking-wider hover:border-[#D4AF37] hover:text-[#D4AF37] active:scale-95 transition-all duration-200 min-h-[56px]"
          >
            View Menu
          </button>
        </div>

        {/* Instagram link */}
        <p className="mt-8 text-gray-500 text-sm">
          Follow us{' '}
          <a
            href="https://www.instagram.com/wallys_nw_soul/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D4AF37] hover:underline"
          >
            @wallys_nw_soul
          </a>
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
