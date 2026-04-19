// src/lib/theme.js - JS version (no TS types)
const { createContext, useContext, useEffect, useState } = React

const ThemeContext = createContext(undefined)

export function ThemeProvider({ 
  children, 
  defaultTheme = 'dark', 
  enableSystem = true 
}) {
  const [theme, setTheme] = useState(defaultTheme)

  useEffect(() => {
    if (!enableSystem || typeof window === 'undefined' || !window.matchMedia) return

    function handleSystemChange(e) {
      setTheme(e.matches ? 'dark' : 'light')
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    handleSystemChange(mediaQuery)
    mediaQuery.addEventListener('change', handleSystemChange)

    return () => mediaQuery.removeEventListener('change', handleSystemChange)
  }, [enableSystem])

  useEffect(() => {
    const root = window.document?.documentElement
    root?.classList.remove('light', 'dark')
    root?.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
  }

  return React.createElement(ThemeContext.Provider, {
    value: { theme, toggleTheme }
  }, children)
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
