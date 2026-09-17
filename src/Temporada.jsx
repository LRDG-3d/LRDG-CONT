import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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

  return (
    <>
      <SiteHeader />

      <section>
        <div className="section-head">
          <h2>{temporada ? temporada.nombre : 'Cargando…'}</h2>
        </div>

        {episodios.length > 0 ? (
          <div className="ep-bar-list">
            {episodios.map((item, i) => (
              <EpisodeBar key={item.id} item={item} numero={i + 1} />
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
