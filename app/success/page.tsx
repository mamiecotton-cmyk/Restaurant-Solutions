import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        {/* Gold checkmark icon */}
        <div className="w-24 h-24 rounded-full bg-[#D4AF37] flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-12 h-12 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-[#D4AF37] mb-4 uppercase tracking-wide">
          Order Received!
        </h1>
        <p className="text-xl text-white mb-3 font-semibold">
          Your order has been received.
        </p>
        <p className="text-gray-400 text-base mb-10 leading-relaxed">
          Thank you for ordering from Wally&apos;s NW Soul! We&apos;re preparing your food with love.
          You&apos;ll receive a confirmation email shortly.
        </p>

        <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-2xl p-6 mb-10">
          <p className="text-[#D4AF37] font-bold text-lg mb-1">Northwest Soul. Real Flavor.</p>
          <p className="text-gray-400 text-sm">Follow us on Instagram @wallys_nw_soul</p>
        </div>

        <Link
          href="/"
          className="inline-block bg-[#D4AF37] text-black font-black text-lg px-10 py-4 rounded-full uppercase tracking-wider hover:bg-yellow-400 transition-colors duration-200"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
