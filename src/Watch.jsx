import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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

  // Los IDs que genera Firebase (push) se pueden ordenar como texto y
  // quedan en orden cronológico, así que sirven para saber cuáles son
  // los capítulos más nuevos sin necesitar un campo de fecha aparte.
  const masNuevos = [...capitulos]
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(-5)
    .reverse()

  const relacionados = episodio
    ? [episodio, ...masNuevos.filter((c) => c.id !== episodio.id)].slice(0, 5)
    : []

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

            <Comments node={`comentarios/capitulo_${episodio.id}`} />
          </div>

          {relacionados.length > 0 && (
            <div className="watch-related">
              <h2>Más capítulos</h2>
              <div className="episodes-rail">
                {relacionados.map((item) => (
                  <EpisodeCard key={item.id} item={item} actual={item.id === episodio.id} />
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
