import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './Home.jsx'
import Admin from './Admin.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </HashRouter>
  )
}
