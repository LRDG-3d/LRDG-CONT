import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import VideoPlayer from './VideoPlayer.jsx'
import Comments from './Comments.jsx'
import { EpisodeCard } from './Cards.jsx'
import SiteHeader from './SiteHeader.jsx'

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

function esMismoDia(timestamp) {
  if (!timestamp) return false
  const a = new Date(timestamp)
  const b = new Date()
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function Watch() {
  const { id } = useParams()
  const [capitulos, setCapitulos] = useState([])
  const [destacadosIds, setDestacadosIds] = useState([])

  useEffect(() => {
    const unsub = onValue(ref(db, 'capitulos'), (snap) => {
      setCapitulos(toArray(snap.val()))
    })
    const unsubDest = onValue(ref(db, 'destacados'), (snap) => {
      setDestacadosIds(snap.val() || [])
    })
    return () => {
      unsub()
      unsubDest()
    }
  }, [])

  const episodio = capitulos.find((c) => c.id === id)

  const ordenados = [...capitulos].sort((a, b) => b.id.localeCompare(a.id))

  const recientes = ordenados.filter((c) => esMismoDia(c.creadoEn)).slice(0, 4)

  const destacados = destacadosIds
    .map((did) => capitulos.find((c) => c.id === did))
    .filter(Boolean)

  const idsRecientes = new Set(recientes.map((c) => c.id))
  let yMas = ordenados.filter((c) => !idsRecientes.has(c.id)).slice(0, 10)

  if (episodio) {
    const yaVisible =
      recientes.some((c) => c.id === episodio.id) ||
      destacados.some((c) => c.id === episodio.id) ||
      yMas.some((c) => c.id === episodio.id)
    if (!yaVisible) {
      yMas = [episodio, ...yMas].slice(0, 10)
    }
  }

  return (
    <>
      <SiteHeader />

      {!episodio ? (
        <div className="watch-loading">Cargando capítulo…</div>
      ) : (
        <div className="watch-page">
          <div className="watch-main">
            <div className="watch-player">
              {episodio.video ? (
                <VideoPlayer
                  src={episodio.video}
                  poster={episodio.miniatura}
                  titulo={episodio.titulo}
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

            {recientes.length > 0 && (
              <div className="watch-related">
                <h2>Recientes</h2>
                <div className="episodes-rail">
                  {recientes.map((item) => (
                    <EpisodeCard key={item.id} item={item} actual={item.id === episodio.id} />
                  ))}
                </div>
              </div>
            )}

            {destacados.length > 0 && (
              <div className="watch-related">
                <h2>No te pierdas de ver estos capítulos</h2>
                <div className="episodes-rail">
                  {destacados.map((item) => (
                    <EpisodeCard key={item.id} item={item} actual={item.id === episodio.id} />
                  ))}
                </div>
              </div>
            )}

            {yMas.length > 0 && (
              <div className="watch-related">
                <div className="section-head">
                  <h2>Y Más</h2>
                  <Link to="/capitulos">Más capítulos</Link>
                </div>
                <div className="episodes-rail">
                  {yMas.map((item) => (
                    <EpisodeCard key={item.id} item={item} actual={item.id === episodio.id} />
                  ))}
                </div>
              </div>
            )}

            <Comments node={`comentarios/capitulo_${episodio.id}`} />
          </div>
        </div>
      )}

      <footer>© 2026 La Rosa TV</footer>
    </>
  )
}
