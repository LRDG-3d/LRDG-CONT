import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './Home.jsx'
import Watch from './Watch.jsx'
import Noticia from './Noticia.jsx'
import Capitulos from './Capitulos.jsx'
import Noticias from './Noticias.jsx'
import Admin from './Admin.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/capitulo/:id" element={<Watch />} />
        <Route path="/noticia/:id" element={<Noticia />} />
        <Route path="/capitulos" element={<Capitulos />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </HashRouter>
  )
}
