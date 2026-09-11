import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="topbar">
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
      <div className="stripe" />
    </>
  )
}
