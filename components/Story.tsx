'use client'

export default function Story() {
  return (
    <>
      {/* Story Section */}
      <section id="story" className="py-24 px-4" style={{ background: '#050810' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.4em] mb-3"
              style={{ color: '#00D4D4', textShadow: '0 0 8px rgba(0,212,212,0.6)' }}>
              — Our Roots —
            </p>
            <h2 className="text-5xl md:text-6xl font-black uppercase text-white leading-tight"
              style={{ fontFamily: 'Georgia, serif' }}>
              Bringing Culture Back
              <br />
              <span style={{ color: '#D4AF37', textShadow: '0 0 15px rgba(212,175,55,0.4)' }}>
                to the CD
              </span>
            </h2>
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #8B0000)' }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8B0000' }} />
              <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #8B0000)' }} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Chef Wally Washington started cooking at age 10 in his grandmother&apos;s kitchen,
                absorbing her Southern traditions. For over 15 years he served the community
                through catering and pop-up spots before opening Seattle&apos;s most exciting
                soul food destination in fall 2025.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-6">
                Located in the heart of Seattle&apos;s Central District — in the historic space of
                the beloved Catfish Corner — Wally&apos;s is more than a restaurant. It&apos;s a
                homecoming. &ldquo;In Washington, we have our own taste. Our own flavors. Our own
                ingredients. Our own blends.&rdquo;
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Every ingredient is sourced intentionally, many from Black-owned vendors,
                honoring the community that raised him.
              </p>
              <a
                href="https://www.instagram.com/wallys_nw_soul/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold transition-colors"
                style={{ color: '#00D4D4' }}
              >
                <span>Follow @wallys_nw_soul on Instagram</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            <div className="space-y-4">
              {/* Hours */}
              <div className="rounded-2xl p-6" style={{ background: '#0D1220', border: '1px solid rgba(0,212,212,0.15)' }}>
                <h3 className="text-white font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span style={{ color: '#00D4D4' }}>🕐</span> Hours
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    { day: 'Monday', hours: 'Closed', closed: true },
                    { day: 'Tuesday – Saturday', hours: '12:00 PM – 8:00 PM', closed: false },
                    { day: 'Sunday', hours: '12:00 PM – 6:00 PM', closed: false },
                  ].map(item => (
                    <div key={item.day} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-gray-400">{item.day}</span>
                      <span className={item.closed ? 'text-red-500' : 'text-gray-200'} style={!item.closed ? { color: '#D4AF37' } : {}}>
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: '👴🏾', label: 'Est. 2011', desc: '15+ years serving Seattle' },
                  { emoji: '🖤', label: 'Black-Owned', desc: 'Rooted in community' },
                  { emoji: '🌿', label: 'Real Ingredients', desc: 'Local & intentional' },
                  { emoji: '❤️', label: 'Central District', desc: 'Bringing culture home' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl p-4 text-center transition-all duration-300"
                    style={{ background: '#0D1220', border: '1px solid rgba(0,212,212,0.1)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.border = '1px solid rgba(0,212,212,0.4)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.border = '1px solid rgba(0,212,212,0.1)'
                    }}
                  >
                    <span className="text-2xl mb-2 block">{item.emoji}</span>
                    <p className="text-white font-bold text-xs uppercase tracking-wide">{item.label}</p>
                    <p className="text-gray-600 text-xs mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catering Section */}
      <section id="catering" className="py-24 px-4" style={{ background: '#070B14' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-[0.4em] mb-3"
            style={{ color: '#D4AF37', textShadow: '0 0 8px rgba(212,175,55,0.6)' }}>
            — Feed the Whole Crew —
          </p>
          <h2 className="text-5xl md:text-6xl font-black uppercase text-white mb-6"
            style={{ fontFamily: 'Georgia, serif' }}>
            Catering
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
            Chef Wally brings his legendary soul food to your event.
            15+ years of catering experience — from intimate gatherings to large celebrations.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🎉', title: 'Events & Parties', desc: 'Birthdays, graduations, celebrations of all kinds' },
              { icon: '🏢', title: 'Corporate', desc: 'Office lunches, team meetings, company events' },
              { icon: '💍', title: 'Weddings', desc: 'Make your special day unforgettable' },
            ].map(item => (
              <div key={item.title} className="rounded-2xl p-6"
                style={{ background: '#0D1220', border: '1px solid rgba(212,175,55,0.2)' }}>
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="text-white font-black uppercase tracking-wide mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <a
            href="mailto:wallysnwsoul@gmail.com"
            className="inline-flex items-center gap-3 font-black text-lg px-12 py-5 rounded-full uppercase tracking-wider transition-all duration-200 active:scale-95"
            style={{ backgroundColor: '#D4AF37', color: '#050810', boxShadow: '0 0 25px rgba(212,175,55,0.5)' }}
          >
            📧 Get a Catering Quote
          </a>
          <p className="text-gray-600 text-sm mt-4">wallysnwsoul@gmail.com</p>
        </div>
      </section>
    </>
  )
}