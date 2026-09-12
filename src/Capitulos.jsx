import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import { EpisodeCard } from './Cards.jsx'
import SiteHeader from './SiteHeader.jsx'
<<<<<<< HEAD
=======
import { yaEstrenado } from './estreno.js'
>>>>>>> 00196f7 (Agregar programacion de fecha de estreno para capitulos)

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

export default function Capitulos() {
  const [capitulos, setCapitulos] = useState([])

  useEffect(() => {
    const unsub = onValue(ref(db, 'capitulos'), (snap) => {
<<<<<<< HEAD
      setCapitulos(toArray(snap.val()))
=======
      setCapitulos(toArray(snap.val()).filter(yaEstrenado))
>>>>>>> 00196f7 (Agregar programacion de fecha de estreno para capitulos)
    })
    return () => unsub()
  }, [])

  return (
    <>
      <SiteHeader />

      <section>
        <div className="section-head">
          <h2>Todos los capítulos</h2>
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
