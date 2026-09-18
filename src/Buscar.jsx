import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import SiteHeader from './SiteHeader.jsx'
import { EpisodeCard, NewsCard } from './Cards.jsx'
import { yaEstrenado } from './estreno.js'

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

export default function Buscar() {
  const [capitulos, setCapitulos] = useState([])
  const [noticias, setNoticias] = useState([])
  const [q, setQ] = useState('')

  useEffect(() => {
    const unsub1 = onValue(ref(db, 'capitulos'), (snap) => {
      setCapitulos(toArray(snap.val()).filter(yaEstrenado))
    })
    const unsub2 = onValue(ref(db, 'noticias'), (snap) => {
      setNoticias(toArray(snap.val()))
    })
    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  const texto = q.trim().toLowerCase()
  const coincide = (t) => t?.toLowerCase().includes(texto)

  const capitulosResultado = texto
    ? capitulos.filter((c) => coincide(c.titulo) || coincide(c.descripcion))
    : []
  const noticiasResultado = texto
    ? noticias.filter((n) => coincide(n.titulo) || coincide(n.contenido))
    : []

  return (
    <>
      <SiteHeader />

      <section className="buscar-page">
        <div className="section-head">
          <h2>Búsqueda</h2>
        </div>
        <input
          className="buscar-input glass"
          type="text"
          placeholder="Buscar capítulos o noticias…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />

        {!texto ? (
          <p className="empty-state">Escribe algo para empezar a buscar.</p>
        ) : (
          <>
            {capitulosResultado.length > 0 && (
              <>
                <h3 className="admin-subheading">Capítulos</h3>
                <div className="episodes-rail">
                  {capitulosResultado.map((item) => (
                    <EpisodeCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}
            {noticiasResultado.length > 0 && (
              <>
                <h3 className="admin-subheading">Noticias</h3>
                <div className="news-grid">
                  {noticiasResultado.map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}
            {capitulosResultado.length === 0 && noticiasResultado.length === 0 && (
              <p className="empty-state">No se encontró nada con "{q}".</p>
            )}
          </>
        )}
      </section>

      <footer>© 2026 La Rosa TV</footer>
    </>
  )
}
