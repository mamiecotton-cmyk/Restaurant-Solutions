import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import CartDrawer from '@/components/CartDrawer'
import CartButton from '@/components/CartButton'

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
        <CartProvider>
          {/* Floating cart button */}
          <div className="fixed top-4 right-4 z-50">
            <CartButton />
          </div>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
