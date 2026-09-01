import { Link } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link to="/"><i className="bn-icon">●</i><span>En vivo</span></Link>
      <Link to="/capitulos"><i className="bn-icon">▶</i><span>Capítulos</span></Link>
      <Link to="/noticias"><i className="bn-icon">✎</i><span>Noticias</span></Link>
    </nav>
  )
}
