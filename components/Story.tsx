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
              From the Community,
              <br />
              <span style={{ color: '#D4AF37', textShadow: '0 0 15px rgba(212,175,55,0.4)' }}>
                For the Community
              </span>
            </h2>
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #8B0000)' }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8B0000' }} />
              <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #8B0000)' }} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Wally&apos;s NW Soul was born from a love of culture, family, and the kind of food that
                makes you feel at home no matter where you are. Since 2011, every dish has carried
                the tradition of Southern soul food — reimagined for the Pacific Northwest.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                From our crispy catfish to our fall-off-the-bone wings, every plate is made with
                care, intention, and real ingredients. This isn&apos;t fast food — it&apos;s food
                that feeds your soul.
              </p>
              <a
                href="https://www.instagram.com/wallys_nw_soul/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold transition-colors"
                style={{ color: '#00D4D4', textShadow: '0 0 8px rgba(0,212,212,0.4)' }}
              >
                <span>Follow the story on Instagram @wallys_nw_soul</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: '🐟', label: 'Fresh Fish', desc: 'Never frozen, always fresh' },
                { emoji: '🔥', label: 'Made to Order', desc: 'Cooked fresh every time' },
                { emoji: '🌿', label: 'Real Ingredients', desc: 'No shortcuts, ever' },
                { emoji: '❤️', label: 'Community First', desc: 'Built for the neighborhood' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-5 text-center transition-all duration-300"
                  style={{
                    background: '#0D1220',
                    border: '1px solid rgba(0,212,212,0.1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = '1px solid rgba(0,212,212,0.4)'
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0,212,212,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(0,212,212,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span className="text-3xl mb-3 block">{item.emoji}</span>
                  <p className="text-white font-bold text-sm uppercase tracking-wide">{item.label}</p>
                  <p className="text-gray-600 text-xs mt-1">{item.desc}</p>
                </div>
              ))}
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
            Bringing Wally&apos;s soul food to your event, corporate gathering, wedding, or celebration.
            We bring the flavor — you bring the people.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🎉', title: 'Events & Parties', desc: 'Birthdays, graduations, celebrations of all kinds' },
              { icon: '🏢', title: 'Corporate', desc: 'Office lunches, team meetings, company events' },
              { icon: '💍', title: 'Weddings', desc: 'Make your special day unforgettable with soul food' },
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
            style={{
              backgroundColor: '#D4AF37',
              color: '#050810',
              boxShadow: '0 0 25px rgba(212,175,55,0.5)'
            }}
          >
            📧 Get a Catering Quote
          </a>
          <p className="text-gray-600 text-sm mt-4">wallysnwsoul@gmail.com</p>
        </div>
      </section>
    </>
  )
}