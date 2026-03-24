"use client"

import Image from 'next/image'

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

          {/* Contact */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6"
              style={{ color: '#D4AF37' }}>Contact</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p>
                <a href="tel:2066933335" className="hover:text-[#00D4D4] transition-colors">
                  📞 (206) 693-3335
                </a>
              </p>
              <p>
                <a href="mailto:wallysnwsoul@gmail.com" className="hover:text-[#00D4D4] transition-colors">
                  📧 wallysnwsoul@gmail.com
                </a>
              </p>
              <p>📍 2218 S Jackson St<br />
                <span className="ml-5">Seattle, WA 98144</span>
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6"
              style={{ color: '#D4AF37' }}>Quick Links</h4>
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
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(0,212,212,0.08)' }}>
          <p className="text-gray-700 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Wally&apos;s NW Soul Experience. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs uppercase tracking-widest">
            Northwest Soul. Real Flavor.
          </p>
        </div>
      </div>
    </footer>
  )
}