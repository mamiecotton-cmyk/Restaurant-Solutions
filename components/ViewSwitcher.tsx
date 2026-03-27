'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const VIEWS = [
  { href: '/kitchen', label: '🔥 Kitchen' },
  { href: '/admin', label: '📋 Front Counter' },
  { href: '/owner', label: '📊 Owner' },
]

export default function ViewSwitcher() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1">
      {VIEWS.map((v) => (
        <Link
          key={v.href}
          href={v.href}
          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors ${
            pathname === v.href
              ? 'bg-white/10 text-white'
              : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          {v.label}
        </Link>
      ))}
    </div>
  )
}