'use client'

import { usePathname } from 'next/navigation'

export default function ConditionalPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <div className={isAdmin ? '' : 'pt-20'}>
      {children}
    </div>
  )
}
