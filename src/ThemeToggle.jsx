import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const guardado = localStorage.getItem('lrdg-theme')
    setDark(guardado === 'dark')
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark-mode', dark)
    localStorage.setItem('lrdg-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      className="theme-toggle"
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? 'Cambiar a modo normal' : 'Cambiar a modo nocturno'}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        </svg>
      )}
    </button>
  )
}
