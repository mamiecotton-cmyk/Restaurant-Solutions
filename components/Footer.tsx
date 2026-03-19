export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-[#D4AF37] uppercase tracking-wide">Wally&apos;s NW Soul</h3>
            <p className="text-gray-500 text-sm mt-1 tracking-widest uppercase">Northwest Soul. Real Flavor.</p>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm">
            <a href="#menu" className="text-gray-400 hover:text-[#D4AF37] transition-colors uppercase tracking-wider">Menu</a>
            <a
              href="https://www.instagram.com/wallys_nw_soul/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#D4AF37] transition-colors uppercase tracking-wider"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Wally&apos;s NW Soul. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
