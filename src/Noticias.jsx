import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import { NewsCard } from './Cards.jsx'
import SiteHeader from './SiteHeader.jsx'

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

export default function Noticias() {
  const [noticias, setNoticias] = useState([])

  useEffect(() => {
    const unsub = onValue(ref(db, 'noticias'), (snap) => {
      setNoticias(toArray(snap.val()))
    })
    return () => unsub()
  }, [])

  return (
    <>
      <SiteHeader />

      <section>
        <div className="section-head">
          <h2>Todas las noticias</h2>
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

      <footer>© 2026 La Rosa TV</footer>
    </>
  )
}
