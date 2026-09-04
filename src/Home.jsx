import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import VideoPlayer from './VideoPlayer.jsx'
import { getLiveState } from './liveSchedule.js'
import { NewsCard, EpisodeCard } from './Cards.jsx'
import SiteHeader from './SiteHeader.jsx'

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

export default function Home() {
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

    return () => {
      unsubNoticias()
      unsubCapitulos()
      unsubEnVivo()
    }
  }, [])

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
      <SiteHeader />

      <div className="hero">
        <div>
          <div className="hero-eyebrow">Transmisión en vivo</div>
          <h1>Noticias y capítulos completos, cuando quieras verlos.</h1>
          <p>
            Ponte al día con lo último y revive tus capítulos favoritos de La
            Rosa de Guadalupe, temporada por temporada.
          </p>
        </div>

        <div className="hero-player" id="live-container">
          {liveState?.episodio ? (
            <>
              <VideoPlayer
                key={liveState.episodio.id}
                src={liveState.episodio.video}
                poster={liveState.episodio.miniatura}
                titulo={liveState.episodio.titulo}
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
          <a href="#/noticias">Ver todas</a>
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
          <a href="#/capitulos">Ver todas las temporadas</a>
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
