'use client'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

export default function Footer() {
  return (
    <footer className="px-4 pt-16 pb-8" style={{
      background: '#050810',
      borderTop: '1px solid rgba(0,212,212,0.1)'
    }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/Wallys_Logo.jpg"
                alt="Wally's NW Soul"
                width={60}
                height={60}
                className="rounded-full"
                style={{ filter: 'drop-shadow(0 0 10px rgba(0,212,212,0.6))' }}
              />
              <div>
                <h3 className="font-black text-xl uppercase" style={{
                  color: '#00D4D4',
                  textShadow: '0 0 10px rgba(0,212,212,0.5)',
                  fontFamily: 'Georgia, serif'
                }}>Wally&apos;s</h3>
                <p className="text-white text-xs uppercase tracking-[0.2em] font-semibold opacity-70">NW Soul Experience</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Northwest Soul. Real Flavor.<br />
              Serving Seattle since 2011.
            </p>
            <a
              href="https://www.instagram.com/wallys_nw_soul/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold transition-colors"
              style={{ color: '#00D4D4' }}
            >
              @wallys_nw_soul
            </a>
          </div>

          {/* Hours & Contact */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-6" style={{ color: '#D4AF37' }}>
              Hours & Contact
            </h4>
            <div className="space-y-2 text-sm text-gray-400 mb-4">
              <p><span className="text-gray-600">Mon</span> — <span className="text-red-500">Closed</span></p>
              <p><span className="text-gray-600">Tue–Sat</span> — <span style={{ color: '#D4AF37' }}>12pm–8pm</span></p>
              <p><span className="text-gray-600">Sun</span> — <span style={{ color: '#D4AF37' }}>12pm–6pm</span></p>
            </div>
            <div className="space-y-2 text-sm text-gray-400 mt-4">
              <p><a href="tel:2066933335" className="hover:text-[#00D4D4] transition-colors">📞 (206) 693-3335</a></p>
              <p><a href="mailto:wallysnwsoul@gmail.com" className="hover:text-[#00D4D4] transition-colors">📧 wallysnwsoul@gmail.com</a></p>
              <a
                href="https://maps.google.com/?q=2218+S+Jackson+St+Seattle+WA+98144"
                target="_blank" rel="noopener noreferrer"
                className="hover:text-[#00D4D4] transition-colors"
              >
                📍 2218 S Jackson St<br /><span className="ml-5">Seattle, WA 98144</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-6" style={{ color: '#D4AF37' }}>
              Quick Links
            </h4>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Menu', id: 'menu' },
                { label: 'Our Story', id: 'story' },
                { label: 'Catering', id: 'catering' },
              ].map(item => (
                <div key={item.id}>
                  <button
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-[#00D4D4] transition-colors uppercase tracking-wider text-xs font-bold"
                  >
                    {item.label}
                  </button>
                </div>
              ))}
              <div>
                <a
                  href="https://www.instagram.com/wallys_nw_soul/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#00D4D4] transition-colors uppercase tracking-wider text-xs font-bold"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(0,212,212,0.08)' }}>
          <p className="text-gray-700 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Wally&apos;s NW Soul Experience. All rights reserved.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-gray-700 text-xs uppercase tracking-widest">
              Northwest Soul. Real Flavor.
            </p>
            <ThemeToggle />
            <Link href="/settings" className="text-gray-400 hover:text-[#D4AF37] transition-colors" title="Settings">⚙️</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
