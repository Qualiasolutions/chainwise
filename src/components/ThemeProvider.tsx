'use client'

import { createContext, useContext, useEffect } from 'react'

// Fixed dark purple/black theme - no toggle functionality
const ThemeContext = createContext<{
  theme: 'dark'
}>({
  theme: 'dark',
})

export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Always use dark theme with purple/black styling
  useEffect(() => {
    // Force dark mode class on document
    document.documentElement.classList.add('dark')
    // Remove light mode class if it exists
    document.documentElement.classList.remove('light')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}