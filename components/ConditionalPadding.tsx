'use client'

import { usePathname } from 'next/navigation'

export default function ConditionalPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const noPadding = pathname.startsWith('/admin') || pathname.startsWith('/kitchen') || pathname.startsWith('/owner')

  return (
    <div className={noPadding ? '' : 'pt-20'}>
      {children}
    </div>
  )
}