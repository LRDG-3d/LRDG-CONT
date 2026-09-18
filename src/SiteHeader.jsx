import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="topbar glass">
        <Link to="/" className="brand">
          <span className="dot" /> La Rosa TV
        </Link>
        <nav className={`topnav ${menuOpen ? 'open' : ''}`}>
          <Link to="/">Inicio</Link>
          <Link to="/noticias">Noticias</Link>
          <Link to="/capitulos">Capítulos</Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <button
            className="menu-toggle"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </header>

      <nav className="bottom-nav-glass">
        <Link to="/">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Inicio</span>
        </Link>
        <Link to="/buscar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <span>Búsqueda</span>
        </Link>
        <Link to="/#en-vivo">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
            <path d="M12 5v-.01M12 19.01V19M5 12h-.01M19.01 12H19M6.5 6.5l-.01-.01M17.51 17.51l-.01-.01M6.5 17.5l-.01.01M17.51 6.49l-.01.01" strokeLinecap="round" />
          </svg>
          <span>En Vivo</span>
        </Link>
      </nav>
    </>
  )
}
