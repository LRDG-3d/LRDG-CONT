import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import SiteHeader from './SiteHeader.jsx'
import { EpisodeBar } from './Cards.jsx'
import { yaEstrenado } from './estreno.js'

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

export default function Temporada() {
  const { id } = useParams()
  const [temporada, setTemporada] = useState(null)
  const [capitulos, setCapitulos] = useState([])

  useEffect(() => {
    const unsubTemporada = onValue(ref(db, `temporadas/${id}`), (snap) => {
      setTemporada(snap.val())
    })
    const unsubCapitulos = onValue(ref(db, 'capitulos'), (snap) => {
      setCapitulos(toArray(snap.val()))
    })
    return () => {
      unsubTemporada()
      unsubCapitulos()
    }
  }, [id])

  // Episodios de esta temporada, del más antiguo al más nuevo, numerados
  // en el orden en que se agregaron.
  const episodios = capitulos
    .filter((c) => c.temporadaId === id && yaEstrenado(c))
    .sort((a, b) => a.id.localeCompare(b.id))

  const primerEpisodio = episodios[0]
  const tituloCompleto = temporada ? `La Rosa de Guadalupe ${temporada.nombre}` : 'Cargando…'

  return (
    <>
      <SiteHeader />

      <section className="temporada-page">
        <h1 className="temporada-titulo">{tituloCompleto}</h1>
        {temporada && (
          <p className="temporada-meta">{episodios.length} Episodios</p>
        )}

        <Link
          to={primerEpisodio ? `/capitulo/${primerEpisodio.id}` : '#'}
          className="temporada-hero"
          style={
            temporada?.imagen
              ? { backgroundImage: `url(${temporada.imagen})` }
              : undefined
          }
        >
          <span className="temporada-hero-play">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </Link>

        {temporada?.descripcion && (
          <p className="temporada-descripcion">{temporada.descripcion}</p>
        )}

        <div className="section-head">
          <h2>{temporada ? temporada.nombre.toUpperCase() : ''}</h2>
        </div>

        {episodios.length > 0 ? (
          <div className="ep-bar-list">
            {episodios.map((item, i) => (
              <EpisodeBar key={item.id} item={item} numero={item.numeroEpisodio || i + 1} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Todavía no hay capítulos agregados a esta temporada.
          </div>
        )}
      </section>

      <footer>© 2026 La Rosa TV</footer>
    </>
  )
}
