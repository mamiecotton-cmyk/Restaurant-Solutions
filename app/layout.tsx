import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: "Wally's NW Soul | Northwest Soul. Real Flavor.",
  description: "Order authentic soul food from Wally's NW Soul — crispy catfish, soul wings, po' boys and more. Northwest soul food, direct from us to you.",
  openGraph: {
    title: "Wally's NW Soul",
    description: "Northwest Soul. Real Flavor.",
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}