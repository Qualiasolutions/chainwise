'use client'

import { useState, useEffect } from 'react'

export function useHeaderHeight() {
  const [headerHeight, setHeaderHeight] = useState(64) // Default height

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('[data-header="true"]')
      if (header) {
        const height = header.getBoundingClientRect().height
        setHeaderHeight(height)
        
        // Update CSS variable for global use
        document.documentElement.style.setProperty('--header-height', `${height}px`)
      }
    }

    // Initial measurement
    updateHeaderHeight()

    // Update on resize
    window.addEventListener('resize', updateHeaderHeight)
    
    // Update when header content changes (responsive breakpoints)
    const observer = new ResizeObserver(updateHeaderHeight)
    const header = document.querySelector('[data-header="true"]')
    if (header) {
      observer.observe(header)
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
      observer.disconnect()
    }
  }, [])

  return {
    headerHeight,
    headerHeightClass: `pt-[${headerHeight}px]`,
    headerStyle: { paddingTop: headerHeight },
    cssVar: `var(--header-height, ${headerHeight}px)`
  }
}