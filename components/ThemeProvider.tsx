'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({ theme: 'dark', setTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const local = localStorage.getItem('theme') as Theme | null
    if (local) {
      applyTheme(local)
    } else {
      fetch('/api/theme')
        .then(r => r.json())
        .then(d => {
          const t = d.theme as Theme
          localStorage.setItem('theme', t)
          applyTheme(t)
        })
        .catch(() => applyTheme('dark'))
    }
  }, [])

  function applyTheme(t: Theme) {
    setThemeState(t)
    document.documentElement.setAttribute('data-theme', t)
  }

  function setTheme(t: Theme) {
    localStorage.setItem('theme', t)
    applyTheme(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}