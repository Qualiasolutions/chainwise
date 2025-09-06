'use client'

import { createContext, useContext } from 'react'

// Fixed light theme - no toggle functionality
const ThemeContext = createContext<{
  theme: 'light'
}>({
  theme: 'light',
})

export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Always use light theme
  return (
    <ThemeContext.Provider value={{ theme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  )
}