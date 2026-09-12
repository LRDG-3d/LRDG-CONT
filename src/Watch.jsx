import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import VideoPlayer from './VideoPlayer.jsx'
import Comments from './Comments.jsx'
import SiteHeader from './SiteHeader.jsx'
<<<<<<< HEAD
=======
import { yaEstrenado, formatFechaEstreno } from './estreno.js'
>>>>>>> 00196f7 (Agregar programacion de fecha de estreno para capitulos)

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

  return (
    <>
      <SiteHeader />

      {!episodio ? (
        <div className="watch-loading">Cargando capítulo…</div>
      ) : !yaEstrenado(episodio) ? (
        <div className="watch-loading">
          🕒 Este capítulo se estrena el {formatFechaEstreno(episodio.estrenoEn)}.
        </div>
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
        </div>
      )}

      <footer>© 2026 La Rosa TV</footer>
    </>
  )
}
