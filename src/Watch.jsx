import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

export default function Watch() {
  const { id } = useParams()
  const [capitulos, setCapitulos] = useState([])

  useEffect(() => {
    const unsub = onValue(ref(db, 'capitulos'), (snap) => {
      setCapitulos(toArray(snap.val()))
    })
    return () => unsub()
  }, [])

  const episodio = capitulos.find((c) => c.id === id)
  const relacionados = capitulos.filter((c) => c.id !== id)

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="dot" /> La Rosa TV
        </div>
        <nav className="topnav">
          <Link to="/" className="active">Inicio</Link>
        </nav>
      </header>
      <div className="stripe" />

      {!episodio ? (
        <div className="watch-loading">Cargando capítulo…</div>
      ) : (
        <div className="watch-page">
          <div className="watch-player">
            {episodio.video ? (
              <video
                src={episodio.video}
                controls
                autoPlay
                poster={episodio.miniatura || undefined}
              />
            ) : (
              <div className="watch-player-empty">
                Este capítulo aún no tiene video agregado.
              </div>
            )}
          </div>

          <div className="watch-body">
            <h1>{episodio.titulo}</h1>
            <div className="ep-meta watch-meta">
              {episodio.duracion && (
                <>
                  <span className="ep-duracion">{episodio.duracion}</span>
                  <span className="ep-sep">·</span>
                </>
              )}
              <span className="ep-tipo">
                {(episodio.tipo || 'Capítulo').toUpperCase()}
              </span>
            </div>
            {episodio.descripcion && (
              <p className="watch-description">{episodio.descripcion}</p>
            )}
          </div>

          {relacionados.length > 0 && (
            <div className="watch-related">
              <h2>Más capítulos</h2>
              <div className="episodes-rail">
                {relacionados.map((item) => (
                  <Link
                    key={item.id}
                    to={`/capitulo/${item.id}`}
                    className="ep-card"
                  >
                    <div
                      className="ep-thumb"
                      style={
                        item.miniatura
                          ? { backgroundImage: `url(${item.miniatura})` }
                          : undefined
                      }
                    >
                      {!item.miniatura && (
                        <span className="ep-thumb-fallback">▶</span>
                      )}
                    </div>
                    <h5>{item.titulo}</h5>
                    <div className="ep-meta">
                      {item.duracion && (
                        <>
                          <span className="ep-duracion">{item.duracion}</span>
                          <span className="ep-sep">·</span>
                        </>
                      )}
                      <span className="ep-tipo">
                        {(item.tipo || 'Capítulo').toUpperCase()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <footer>© 2026 La Rosa TV</footer>
    </>
  )
}
