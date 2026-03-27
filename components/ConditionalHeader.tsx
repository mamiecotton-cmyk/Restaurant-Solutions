'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  const hideHeader = pathname.startsWith('/admin') || pathname.startsWith('/kitchen') || pathname.startsWith('/owner')

  if (hideHeader) return null
  return <Header />
}