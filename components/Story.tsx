export default function Story() {
  return (
    <section className="py-24 px-4 bg-[#111111]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm font-bold mb-3">— Our Roots —</p>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            From the Community,
            <br />
            <span className="text-[#D4AF37]">For the Community</span>
          </h2>
          <div className="w-16 h-1 bg-[#8B0000] mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Wally&apos;s NW Soul was born from a love of culture, family, and the kind of food that
              makes you feel at home no matter where you are. Every dish carries the tradition of
              Southern soul food — reimagined for the Pacific Northwest.
            </p>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              From our crispy catfish to our fall-off-the-bone wings, every plate is made with
              care, intention, and real ingredients. This isn&apos;t fast food — it&apos;s food
              that feeds your soul.
            </p>
            <a
              href="https://www.instagram.com/wallys_nw_soul/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#D4AF37] font-bold hover:text-yellow-300 transition-colors"
            >
              <span>Follow the story on Instagram</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Stats / Values */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: '🐟', label: 'Fresh Fish', desc: 'Never frozen, always fresh' },
              { emoji: '🔥', label: 'Made to Order', desc: 'Cooked fresh every time' },
              { emoji: '🌿', label: 'Real Ingredients', desc: 'No shortcuts, ever' },
              { emoji: '❤️', label: 'Community First', desc: 'Built for the neighborhood' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 text-center hover:border-[#D4AF37]/30 transition-colors"
              >
                <span className="text-3xl mb-3 block">{item.emoji}</span>
                <p className="text-white font-bold text-sm uppercase tracking-wide">{item.label}</p>
                <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
