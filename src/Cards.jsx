import { Link } from 'react-router-dom'

export function NewsCard({ item }) {
  return (
    <Link to={`/noticia/${item.id}`} className="news-card">
      <div
        className="news-thumb"
        style={item.imagen ? { backgroundImage: `url(${item.imagen})` } : undefined}
      />
      <h4>{item.titulo}</h4>
      <div className="ep-meta">
        {item.tag && <span className="ep-tipo">{item.tag.toUpperCase()}</span>}
        {item.tag && item.fecha && <span className="ep-sep">·</span>}
        {item.fecha && <span className="ep-duracion">{item.fecha}</span>}
      </div>
    </Link>
  )
}

export function EpisodeCard({ item }) {
  return (
    <Link to={`/capitulo/${item.id}`} className="ep-card">
      <div
        className="ep-thumb"
        style={
          item.miniatura
            ? { backgroundImage: `url(${item.miniatura})` }
            : undefined
        }
      >
        {!item.miniatura && <span className="ep-thumb-fallback">▶</span>}
      </div>
      <div className="ep-info">
        <h5>{item.titulo}</h5>
        <div className="ep-meta">
          {item.duracion && (
            <>
              <span className="ep-duracion">{item.duracion}</span>
              <span className="ep-sep">·</span>
            </>
          )}
          <span className="ep-tipo">{(item.tipo || 'Capítulo').toUpperCase()}</span>
        </div>
      </div>
    </Link>
  )
}
