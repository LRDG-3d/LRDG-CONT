import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'

// Convierte un objeto de Firebase ({ id1: {...}, id2: {...} }) en un
// arreglo [{ id: 'id1', ... }, { id: 'id2', ... }] para poder mapearlo.
function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

function NewsCard({ item }) {
  return (
    <div className="news-card">
      <div className="news-thumb" />
      <div className="tag">{item.tag}</div>
      <h4>{item.titulo}</h4>
      <div className="meta">{item.fecha}</div>
    </div>
  )
}

function EpisodeCard({ item }) {
  return (
    <div className="ep-card">
      <div className="ep-thumb">
        <span className="num">{item.numero}</span>
      </div>
      <h5>{item.titulo}</h5>
      <div className="season">{item.temporada}</div>
    </div>
  )
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [noticias, setNoticias] = useState([])
  const [capitulos, setCapitulos] = useState([])
  const [enVivo, setEnVivo] = useState(null)

  useEffect(() => {
    const unsubNoticias = onValue(ref(db, 'noticias'), (snap) => {
      setNoticias(toArray(snap.val()))
    })
    const unsubCapitulos = onValue(ref(db, 'capitulos'), (snap) => {
      setCapitulos(toArray(snap.val()))
    })
    const unsubEnVivo = onValue(ref(db, 'enVivo'), (snap) => {
      setEnVivo(snap.val())
    })

    // Se cancela la escucha al desmontar el componente
    return () => {
      unsubNoticias()
      unsubCapitulos()
      unsubEnVivo()
    }
  }, [])

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="dot" /> La Rosa TV
        </div>
        <nav className={`topnav ${menuOpen ? 'open' : ''}`}>
          <a href="#inicio" className="active">Inicio</a>
          <a href="#noticias">Noticias</a>
          <a href="#capitulos">Capítulos</a>
          <a href="#en-vivo">En Vivo</a>
        </nav>
        <button
          className="menu-toggle"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </header>
      <div className="stripe" />

      <div className="hero">
        <div>
          <div className="hero-eyebrow">Transmisión en vivo</div>
          <h1>Noticias y capítulos completos, cuando quieras verlos.</h1>
          <p>
            Ponte al día con lo último y revive tus capítulos favoritos de La
            Rosa de Guadalupe, temporada por temporada.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary">Ver en vivo</button>
            <button className="btn btn-ghost">Explorar capítulos</button>
          </div>
        </div>

        <div className="hero-player" id="live-container">
          {enVivo ? (
            <div className="now">
              <div className="live">En vivo ahora</div>
              <h3>{enVivo.titulo}</h3>
            </div>
          ) : (
            <span className="placeholder">Aún no hay transmisión en vivo.</span>
          )}
        </div>
      </div>

      <section id="noticias">
        <div className="section-head">
          <h2>Noticias</h2>
          <a href="#">Ver todas</a>
        </div>
        {noticias.length > 0 ? (
          <div className="news-grid">
            {noticias.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="empty-state">Aún no hay noticias agregadas.</div>
        )}
      </section>

      <section id="capitulos">
        <div className="section-head">
          <h2>Capítulos completos</h2>
          <a href="#">Ver todas las temporadas</a>
        </div>
        {capitulos.length > 0 ? (
          <div className="episodes-rail">
            {capitulos.map((item) => (
              <EpisodeCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="empty-state">Aún no hay capítulos agregados.</div>
        )}
      </section>

      <footer>© 2026 La Rosa TV</footer>
    </>
  )
}
