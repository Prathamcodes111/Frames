'use client'

import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check localStorage first, then system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
      setIsDark(shouldBeDark)
      updateTheme(shouldBeDark)
    }
  }, [])

  const toggleDarkMode = () => {
    const newValue = !isDark
    console.log('Toggling dark mode to:', newValue) // Debug log
    setIsDark(newValue)
    
    if (typeof window !== 'undefined') {
      updateTheme(newValue)
      localStorage.setItem('theme', newValue ? 'dark' : 'light')
      console.log('Theme updated, class on html:', document.documentElement.classList.contains('dark')) // Debug log
    }
  }

  return { isDark, toggleDarkMode, mounted }
}

function updateTheme(isDark: boolean) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('scheme-light')
      root.classList.add('scheme-dark')
    } else {
      root.classList.remove('dark')
      root.classList.remove('scheme-dark')
      root.classList.add('scheme-light')
    }
    console.log('HTML classes after update:', root.className)
  }
}

