'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors duration-200"
      style={{ color: 'var(--color-muted)' }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
    >
      {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  )
}