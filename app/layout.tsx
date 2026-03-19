import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Wally's NW Soul | Northwest Soul. Real Flavor.",
  description: "Order authentic soul food from Wally's NW Soul — crispy catfish, soul wings, po' boys and more. Northwest soul food, direct from us to you.",
  openGraph: {
    title: "Wally's NW Soul",
    description: "Northwest Soul. Real Flavor.",
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
