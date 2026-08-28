import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import VideoPlayer from './VideoPlayer.jsx'
import { getLiveState } from './liveSchedule.js'
import ThemeToggle from './ThemeToggle.jsx'

// Convierte un objeto de Firebase ({ id1: {...}, id2: {...} }) en un
// arreglo [{ id: 'id1', ... }, { id: 'id2', ... }] para poder mapearlo.
function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

function NewsCard({ item }) {
  return (
    <Link to={`/noticia/${item.id}`} className="news-card">
      <div className="news-thumb" />
      <h4>{item.titulo}</h4>
      <div className="ep-meta">
        {item.tag && <span className="ep-tipo">{item.tag.toUpperCase()}</span>}
        {item.tag && item.fecha && <span className="ep-sep">·</span>}
        {item.fecha && <span className="ep-duracion">{item.fecha}</span>}
      </div>
    </Link>
  )
}

function EpisodeCard({ item }) {
  return (
    <Link to={`/capitulo/${item.id}`} className="ep-card">
      <div
        className="ep-thumb"
        style={
          item.miniatura
            ? { backgroundImage: `url(${item.miniatura})` }
            : undefined
        }
      >
        {!item.miniatura && <span className="ep-thumb-fallback">▶</span>}
      </div>
      <h5>{item.titulo}</h5>
      <div className="ep-meta">
        {item.duracion && (
          <>
            <span className="ep-duracion">{item.duracion}</span>
            <span className="ep-sep">·</span>
          </>
        )}
        <span className="ep-tipo">{(item.tipo || 'Capítulo').toUpperCase()}</span>
      </div>
    </Link>
  )
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [noticias, setNoticias] = useState([])
  const [capitulos, setCapitulos] = useState([])
  const [enVivo, setEnVivo] = useState(null)
  const [liveState, setLiveState] = useState(null)

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

  // Recalcula, cada pocos segundos, qué capítulo "toca" ahora en la cola
  // en vivo según el reloj, para que avance solo cuando corresponda.
  useEffect(() => {
    if (!enVivo?.queue?.length || !capitulos.length) {
      setLiveState(null)
      return
    }
    const episodios = enVivo.queue
      .map((id) => capitulos.find((c) => c.id === id))
      .filter(Boolean)

    const recalcular = () => setLiveState(getLiveState(episodios, enVivo.startedAt))
    recalcular()
    const interval = setInterval(recalcular, 5000)
    return () => clearInterval(interval)
  }, [enVivo, capitulos])

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
          {liveState?.episodio ? (
            <>
              <VideoPlayer
                key={liveState.episodio.id}
                src={liveState.episodio.video}
                poster={liveState.episodio.miniatura}
                live
                startOffset={liveState.offset}
              />
              <div className="live-badge">🔴 EN VIVO — {liveState.episodio.titulo}</div>
            </>
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
