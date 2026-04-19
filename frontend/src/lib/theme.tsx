 'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  enableSystem = true,
}: {
  children: React.ReactNode
  defaultTheme?: ThemeContextType['theme']
  enableSystem?: boolean
}) {
  const [theme, setTheme] = useState<ThemeContextType['theme']>(defaultTheme)

  useEffect(() => {
    if (!enableSystem || typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    function handleSystemChange(e: MediaQueryListEvent) {
      setTheme(e.matches ? 'dark' : 'light')
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    handleSystemChange(mediaQuery)
    mediaQuery.addEventListener('change', handleSystemChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange)
    }
  }, [enableSystem])

  useEffect(() => {
    const root = window.document?.documentElement

    root?.classList.remove('light', 'dark')

    if (theme === 'system') {
      root?.classList.add(enableSystem ? 'dark' : 'light')
    } else {
      root?.classList.add(theme)
    }
  }, [theme])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
