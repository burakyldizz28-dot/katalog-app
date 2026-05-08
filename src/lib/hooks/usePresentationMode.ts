'use client'

import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'presentation_mode'
const EVENT_NAME = 'presentation-mode-change'

export function usePresentationMode() {
  const [presentationMode, setPresentationMode] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // İlk yüklemede localStorage'dan oku
    const stored = localStorage.getItem(STORAGE_KEY)
    setPresentationMode(stored === '1')

    // Toggle olduğunda tetiklenen handler — TEK source of truth: localStorage
    const handler = () => {
      const value = localStorage.getItem(STORAGE_KEY)
      setPresentationMode(value === '1')
    }

    window.addEventListener(EVENT_NAME, handler)
    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener(EVENT_NAME, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const togglePresentationMode = useCallback(() => {
    if (typeof window === 'undefined') return

    // Mevcut değeri direkt localStorage'dan oku (closure sorunu yok)
    const current = localStorage.getItem(STORAGE_KEY) === '1'
    const next = !current

    // Önce localStorage, sonra event — handler tüm component'leri sync eder
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    window.dispatchEvent(new Event(EVENT_NAME))
  }, [])

  return { presentationMode, togglePresentationMode }
}