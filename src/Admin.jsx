import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
import { ref, push, set, remove, onValue } from 'firebase/database'
import { auth, db } from './firebase'
import './Admin.css'

function toArray(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([id, value]) => ({ id, ...value }))
}

// ---------- Pantalla de inicio de sesión ----------
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <form onSubmit={handleSubmit} className="admin-login-card">
        <h1>Acceso admin</h1>
        <label>
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

// ---------- Formulario genérico para agregar una noticia ----------
function NoticiaForm() {
  const [titulo, setTitulo] = useState('')
  const [tag, setTag] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return
    const nuevaRef = push(ref(db, 'noticias'))
    await set(nuevaRef, {
      titulo,
      tag: tag || 'General',
      fecha: new Date().toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    })
    setTitulo('')
    setTag('')
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <input
        placeholder="Título de la noticia"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <input
        placeholder="Etiqueta (ej. Entretenimiento)"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      />
      <button type="submit">Agregar noticia</button>
    </form>
  )
}

// ---------- Formulario para agregar un capítulo ----------
function CapituloForm() {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [miniatura, setMiniatura] = useState('')
  const [video, setVideo] = useState('')
  const [duracion, setDuracion] = useState('')
  const [tipo, setTipo] = useState('Capítulo')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return
    const nuevaRef = push(ref(db, 'capitulos'))
    await set(nuevaRef, {
      titulo,
      descripcion: descripcion.trim(),
      miniatura: miniatura.trim(),
      video: video.trim(),
      duracion: duracion.trim(),
      tipo,
    })
    setTitulo('')
    setDescripcion('')
    setMiniatura('')
    setVideo('')
    setDuracion('')
    setTipo('Capítulo')
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form admin-form-stacked">
      <input
        placeholder="Título del capítulo"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <textarea
        placeholder="Descripción del capítulo"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={3}
      />
      <div className="admin-form-row">
        <input
          placeholder="Duración (ej. 40:00)"
          value={duracion}
          onChange={(e) => setDuracion(e.target.value)}
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="Capítulo">Capítulo</option>
          <option value="Video">Video</option>
          <option value="Promoción">Promoción</option>
        </select>
      </div>
      <input
        placeholder="URL de la miniatura (imagen)"
        value={miniatura}
        onChange={(e) => setMiniatura(e.target.value)}
      />
      <input
        placeholder="URL del video (ej. archive.org/download/.../CAP.mp4)"
        value={video}
        onChange={(e) => setVideo(e.target.value)}
      />
      <button type="submit">Agregar capítulo</button>
    </form>
  )
}

// ---------- Control de "En Vivo" ----------
function EnVivoControl() {
  const [titulo, setTitulo] = useState('')
  const [activo, setActivo] = useState(false)

  useEffect(() => {
    const unsub = onValue(ref(db, 'enVivo'), (snap) => {
      const val = snap.val()
      setActivo(!!val)
      setTitulo(val?.titulo || '')
    })
    return () => unsub()
  }, [])

  const activar = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return
    await set(ref(db, 'enVivo'), { titulo })
  }

  const desactivar = async () => {
    await remove(ref(db, 'enVivo'))
  }

  return (
    <div className="admin-form-block">
      <p className="admin-status">
        Estado actual: {activo ? '🔴 En vivo' : '⚪ Sin transmisión'}
      </p>
      <form onSubmit={activar} className="admin-form">
        <input
          placeholder="Título de la transmisión"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <button type="submit">Poner en vivo</button>
      </form>
      {activo && (
        <button className="admin-danger" onClick={desactivar}>
          Terminar transmisión
        </button>
      )}
    </div>
  )
}

// ---------- Lista con botón de eliminar, reutilizable ----------
function ListaConEliminar({ path, items, renderLabel }) {
  const eliminar = (id) => remove(ref(db, `${path}/${id}`))

  if (items.length === 0) {
    return <p className="admin-empty">Sin elementos todavía.</p>
  }

  return (
    <ul className="admin-list">
      {items.map((item) => (
        <li key={item.id}>
          <span>{renderLabel(item)}</span>
          <button onClick={() => eliminar(item.id)}>Eliminar</button>
        </li>
      ))}
    </ul>
  )
}

// ---------- Panel principal (una vez con sesión iniciada) ----------
function Panel({ user }) {
  const [tab, setTab] = useState('noticias')
  const [noticias, setNoticias] = useState([])
  const [capitulos, setCapitulos] = useState([])

  useEffect(() => {
    const unsubN = onValue(ref(db, 'noticias'), (s) => setNoticias(toArray(s.val())))
    const unsubC = onValue(ref(db, 'capitulos'), (s) => setCapitulos(toArray(s.val())))
    return () => {
      unsubN()
      unsubC()
    }
  }, [])

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>Panel de administración</h1>
        <div>
          <span className="admin-user">{user.email}</span>
          <button onClick={() => signOut(auth)}>Cerrar sesión</button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button
          className={tab === 'noticias' ? 'active' : ''}
          onClick={() => setTab('noticias')}
        >
          Noticias
        </button>
        <button
          className={tab === 'capitulos' ? 'active' : ''}
          onClick={() => setTab('capitulos')}
        >
          Capítulos
        </button>
        <button
          className={tab === 'envivo' ? 'active' : ''}
          onClick={() => setTab('envivo')}
        >
          En Vivo
        </button>
      </nav>

      {tab === 'noticias' && (
        <section>
          <NoticiaForm />
          <ListaConEliminar
            path="noticias"
            items={noticias}
            renderLabel={(n) => `${n.titulo} — ${n.tag}`}
          />
        </section>
      )}

      {tab === 'capitulos' && (
        <section>
          <CapituloForm />
          <ListaConEliminar
            path="capitulos"
            items={capitulos}
            renderLabel={(c) =>
              `${c.titulo} — ${c.tipo || 'Capítulo'}${c.duracion ? ' · ' + c.duracion : ''}${c.video ? ' 🎬' : ''}${c.miniatura ? ' 🖼️' : ''}`
            }
          />
        </section>
      )}

      {tab === 'envivo' && (
        <section>
          <EnVivoControl />
        </section>
      )}
    </div>
  )
}

// ---------- Componente raíz de /admin ----------
export default function Admin() {
  const [user, setUser] = useState(undefined) // undefined = cargando

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  if (user === undefined) return null // evita parpadeo mientras carga
  if (!user) return <Login />
  return <Panel user={user} />
}
