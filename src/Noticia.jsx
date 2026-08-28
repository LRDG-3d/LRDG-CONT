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

function compartir(noticia) {
  const url = window.location.href
  if (navigator.share) {
    navigator.share({ title: noticia.titulo, url }).catch(() => {})
  } else {
    navigator.clipboard?.writeText(url)
  }
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
  const parrafos = (noticia?.contenido || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)

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
        <article className="article-page">
          <div className="article-head">
            {noticia.tag && <div className="article-tag">{noticia.tag}</div>}
            <h1>{noticia.titulo}</h1>
            {noticia.subtitulo && (
              <p className="article-subtitle">{noticia.subtitulo}</p>
            )}

            <div className="article-byline">
              <div className="article-byline-left">
                {noticia.autorImagen && (
                  <img
                    src={noticia.autorImagen}
                    alt={noticia.autor || 'Autor'}
                    className="article-author-photo"
                  />
                )}
                <div>
                  {noticia.autor && (
                    <div className="article-author-name">Por: {noticia.autor}</div>
                  )}
                  {noticia.fecha && (
                    <div className="article-fecha">Publicado el {noticia.fecha}</div>
                  )}
                </div>
              </div>
              <button
                className="article-share"
                onClick={() => compartir(noticia)}
                aria-label="Compartir"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0-3 3l.01.34-6.32 3.68a3 3 0 1 0 0 3.96l6.32 3.68L12 19a3 3 0 1 0 3-3h-.17a3 3 0 0 0-2.66 1.6l-6.13-3.57a3 3 0 0 0 0-1.06l6.13-3.57A3 3 0 0 0 15 11h.17A3 3 0 0 0 18 8z" />
                </svg>
              </button>
            </div>
          </div>

          {noticia.imagen && (
            <>
              <img
                src={noticia.imagen}
                alt={noticia.titulo}
                className="article-hero-img"
              />
              {noticia.imagenCredito && (
                <div className="article-credito">{noticia.imagenCredito}</div>
              )}
            </>
          )}

          <div className="article-body">
            {parrafos.length > 0 ? (
              parrafos.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p className="comments-empty">Esta noticia aún no tiene contenido.</p>
            )}
          </div>

          <Comments node={`comentarios/noticia_${noticia.id}`} />
        </article>
      )}

      <footer>© 2026 La Rosa TV</footer>
    </>
  )
}
