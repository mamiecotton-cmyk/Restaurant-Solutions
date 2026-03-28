'use client'

import { useTheme } from '@/components/ThemeProvider'
import { useState } from 'react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveDefault = async (t: 'dark' | 'light') => {
    setSaving(true)
    setSaved(false)
    setTheme(t)
    await fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: t }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '100vh' }} className="flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase tracking-wide" style={{ color: 'var(--color-gold)' }}>
            Site Settings
          </h1>
          <p className="mt-2 text-sm uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Owner Panel · Sets default for new visitors
          </p>
        </div>

        <div className="rounded-2xl p-8 border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--color-muted)' }}>
            Default Theme
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {(['dark', 'light'] as const).map(t => (
              <button
                key={t}
                onClick={() => saveDefault(t)}
                disabled={saving}
                className="rounded-xl py-6 flex flex-col items-center gap-3 font-black uppercase tracking-wider text-sm transition-all duration-200 border-2"
                style={{
                  background: t === 'dark' ? '#0a0a0a' : '#FAF7F0',
                  color: t === 'dark' ? '#D4AF37' : '#1a1a1a',
                  borderColor: theme === t ? '#D4AF37' : 'transparent',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <span className="text-2xl">{t === 'dark' ? '🌙' : '☀️'}</span>
                {t === 'dark' ? 'Dark' : 'Light'}
                {theme === t && (
                  <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>Active</span>
                )}
              </button>
            ))}
          </div>

          {saved && (
            <p className="text-center text-sm font-bold" style={{ color: '#D4AF37' }}>
              ✓ Default saved to Supabase
            </p>
          )}
        </div>

        <p className="text-center text-xs mt-6 uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
          Visitors who have already chosen a theme locally won't be affected
        </p>
      </div>
    </main>
  )
}
