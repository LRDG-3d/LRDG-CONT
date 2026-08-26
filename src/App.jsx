import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './Home.jsx'
import Watch from './Watch.jsx'
import Admin from './Admin.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/capitulo/:id" element={<Watch />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </HashRouter>
  )
}
