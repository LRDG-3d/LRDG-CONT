import { useState, useEffect } from 'react'
import { ref, push, set, onValue } from 'firebase/database'
import { db } from './firebase'

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

function formatFecha(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// node: ruta de Firebase donde viven los comentarios de este contenido,
// ej. "comentarios/capitulo_-Nabc123"
export default function Comments({ node }) {
  const [comentarios, setComentarios] = useState([])
  const [nombre, setNombre] = useState('')
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const unsub = onValue(ref(db, node), (snap) => {
      const lista = toArray(snap.val()).sort((a, b) => (a.fecha || 0) - (b.fecha || 0))
      setComentarios(lista)
    })
    return () => unsub()
  }, [node])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    try {
      const nuevoRef = push(ref(db, node))
      await set(nuevoRef, {
        nombre: nombre.trim() || 'Anónimo',
        texto: texto.trim().slice(0, 1000),
        fecha: Date.now(),
      })
      setTexto('')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="comments">
      <h2>Comentarios {comentarios.length > 0 && `(${comentarios.length})`}</h2>

      <form onSubmit={handleSubmit} className="comments-form">
        <input
          placeholder="Tu nombre (opcional)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={40}
        />
        <textarea
          placeholder="Escribe un comentario…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          maxLength={1000}
        />
        <button type="submit" disabled={enviando || !texto.trim()}>
          {enviando ? 'Publicando…' : 'Comentar'}
        </button>
      </form>

      {comentarios.length === 0 ? (
        <p className="comments-empty">Sé el primero en comentar.</p>
      ) : (
        <ul className="comments-list">
          {comentarios.map((c) => (
            <li key={c.id}>
              <div className="comments-item-head">
                <span className="comments-nombre">{c.nombre}</span>
                <span className="comments-fecha">{formatFecha(c.fecha)}</span>
              </div>
              <p className="comments-texto">{c.texto}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
