import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import ThemeToggle from './ThemeToggle.jsx'
import Comments from './Comments.jsx'

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

export default function Noticia() {
  const { id } = useParams()
  const [noticias, setNoticias] = useState([])

  useEffect(() => {
    const unsub = onValue(ref(db, 'noticias'), (snap) => {
      setNoticias(toArray(snap.val()))
    })
    return () => unsub()
  }, [])

  const noticia = noticias.find((n) => n.id === id)

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="dot" /> La Rosa TV
        </div>
        <nav className="topnav">
          <Link to="/" className="active">Inicio</Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </header>
      <div className="stripe" />

      {!noticia ? (
        <div className="watch-loading">Cargando noticia…</div>
      ) : (
        <div className="watch-page">
          <div className="watch-body" style={{ paddingTop: 24 }}>
            <div className="ep-meta watch-meta">
              {noticia.tag && <span className="ep-tipo">{noticia.tag.toUpperCase()}</span>}
              {noticia.tag && noticia.fecha && <span className="ep-sep">·</span>}
              {noticia.fecha && <span className="ep-duracion">{noticia.fecha}</span>}
            </div>
            <h1>{noticia.titulo}</h1>
            {noticia.contenido && (
              <p className="watch-description">{noticia.contenido}</p>
            )}
          </div>

          <Comments node={`comentarios/noticia_${noticia.id}`} />
        </div>
      )}

      <footer>© 2026 La Rosa TV</footer>
    </>
  )
}
