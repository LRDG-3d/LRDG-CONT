import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import VideoPlayer from './VideoPlayer.jsx'
import { getLiveState } from './liveSchedule.js'
import { NewsCard, EpisodeCard } from './Cards.jsx'
import SiteHeader from './SiteHeader.jsx'
import { yaEstrenado } from './estreno.js'

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

export default function Home() {
  const [noticias, setNoticias] = useState([])
  const [capitulos, setCapitulos] = useState([])
  const [destacadosIds, setDestacadosIds] = useState([])
  const [enVivo, setEnVivo] = useState(null)
  const [liveState, setLiveState] = useState(null)

  useEffect(() => {
    const unsubNoticias = onValue(ref(db, 'noticias'), (snap) => {
      setNoticias(toArray(snap.val()))
    })
    const unsubCapitulos = onValue(ref(db, 'capitulos'), (snap) => {
      setCapitulos(toArray(snap.val()))
    })
    const unsubDestacados = onValue(ref(db, 'destacados'), (snap) => {
      setDestacadosIds(snap.val() || [])
    })
    const unsubEnVivo = onValue(ref(db, 'enVivo'), (snap) => {
      setEnVivo(snap.val())
    })

    return () => {
      unsubNoticias()
      unsubCapitulos()
      unsubDestacados()
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

  // Los IDs que genera Firebase (push) se pueden ordenar como texto y
  // quedan en orden cronológico, así que sirven para saber cuáles son
  // los capítulos más nuevos sin necesitar un campo de fecha aparte.
  const ordenados = [...capitulos]
    .filter(yaEstrenado)
    .sort((a, b) => b.id.localeCompare(a.id))

  // "MÁS RECIENTES": siempre los 4 capítulos más nuevos que haya, sin
  // importar el día en que se subieron. Cuando agregas uno nuevo, el
  // más viejo de estos 4 sale de aquí (pero sigue en "Y Más").
  const recientes = ordenados.slice(0, 4)

  // "LO MEJOR DE LA ROSA": elegidos a mano en el admin.
  const destacados = destacadosIds
    .map((did) => capitulos.find((c) => c.id === did))
    .filter((c) => c && yaEstrenado(c))

  // "Y Más": el resto de capítulos subidos anteriormente.
  const idsRecientes = new Set(recientes.map((c) => c.id))
  const yMas = ordenados.filter((c) => !idsRecientes.has(c.id)).slice(0, 10)

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

      {recientes.length > 0 && (
        <section>
          <div className="section-head">
            <h2>MÁS RECIENTES</h2>
          </div>
          <div className="episodes-rail">
            {recientes.map((item) => (
              <EpisodeCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {destacados.length > 0 && (
        <section>
          <div className="section-head">
            <h2>LO MEJOR DE LA ROSA</h2>
          </div>
          <div className="episodes-rail">
            {destacados.map((item) => (
              <EpisodeCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="section-head">
          <h2>Y Más</h2>
          <Link to="/capitulos">Más capítulos</Link>
        </div>
        {yMas.length > 0 ? (
          <div className="episodes-rail">
            {yMas.map((item) => (
              <EpisodeCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="empty-state">Aún no hay capítulos agregados.</div>
        )}
      </section>

      <section id="noticias">
        <div className="section-head">
          <h2>Noticias</h2>
          <Link to="/noticias">Ver todas</Link>
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
