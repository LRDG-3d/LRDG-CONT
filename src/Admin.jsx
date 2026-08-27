import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
import { ref, push, set, remove, onValue } from 'firebase/database'
import { auth, db } from './firebase'
import { capturarMiniatura } from './thumbnailCapture.js'
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

// ---------- Formulario genérico para agregar/editar una noticia ----------
function NoticiaForm({ editing, onDone }) {
  const [titulo, setTitulo] = useState('')
  const [tag, setTag] = useState('')

  useEffect(() => {
    setTitulo(editing?.titulo || '')
    setTag(editing?.tag || '')
  }, [editing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return

    if (editing) {
      await set(ref(db, `noticias/${editing.id}`), {
        ...editing,
        titulo,
        tag: tag || 'General',
      })
    } else {
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
    }
    setTitulo('')
    setTag('')
    onDone?.()
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
      <button type="submit">
        {editing ? 'Guardar cambios' : 'Agregar noticia'}
      </button>
      {editing && (
        <button type="button" className="admin-cancel" onClick={onDone}>
          Cancelar
        </button>
      )}
    </form>
  )
}

// ---------- Formulario para agregar/editar un capítulo ----------
function CapituloForm({ editing, onDone }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [miniatura, setMiniatura] = useState('')
  const [video, setVideo] = useState('')
  const [duracion, setDuracion] = useState('')
  const [tipo, setTipo] = useState('Capítulo')
  const [capturando, setCapturando] = useState(false)
  const [errorCaptura, setErrorCaptura] = useState('')

  useEffect(() => {
    setTitulo(editing?.titulo || '')
    setDescripcion(editing?.descripcion || '')
    setMiniatura(editing?.miniatura || '')
    setVideo(editing?.video || '')
    setDuracion(editing?.duracion || '')
    setTipo(editing?.tipo || 'Capítulo')
    setErrorCaptura('')
  }, [editing])

  const generarMiniatura = async () => {
    if (!video.trim()) return
    setCapturando(true)
    setErrorCaptura('')
    try {
      const dataUrl = await capturarMiniatura(video.trim())
      setMiniatura(dataUrl)
    } catch (err) {
      setErrorCaptura(err.message || 'No se pudo generar la miniatura.')
    } finally {
      setCapturando(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return

    const datos = {
      titulo,
      descripcion: descripcion.trim(),
      miniatura: miniatura.trim(),
      video: video.trim(),
      duracion: duracion.trim(),
      tipo,
    }

    if (editing) {
      await set(ref(db, `capitulos/${editing.id}`), datos)
    } else {
      const nuevaRef = push(ref(db, 'capitulos'))
      await set(nuevaRef, datos)
    }

    setTitulo('')
    setDescripcion('')
    setMiniatura('')
    setVideo('')
    setDuracion('')
    setTipo('Capítulo')
    onDone?.()
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
        placeholder="URL del video (ej. archive.org/download/.../CAP.mp4)"
        value={video}
        onChange={(e) => setVideo(e.target.value)}
      />
      <div className="admin-form-row">
        <input
          placeholder="URL de la miniatura (o genera una desde el video)"
          value={miniatura}
          onChange={(e) => setMiniatura(e.target.value)}
        />
        <button
          type="button"
          onClick={generarMiniatura}
          disabled={!video.trim() || capturando}
        >
          {capturando ? 'Capturando…' : '🎲 Generar miniatura'}
        </button>
      </div>
      {errorCaptura && <p className="admin-error">{errorCaptura}</p>}
      {miniatura && (
        <img src={miniatura} alt="Vista previa de la miniatura" className="admin-thumb-preview" />
      )}
      <div className="admin-form-row">
        <button type="submit">
          {editing ? 'Guardar cambios' : 'Agregar capítulo'}
        </button>
        {editing && (
          <button type="button" className="admin-cancel" onClick={onDone}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

// ---------- Control de "En Vivo" (cola de capítulos con horario real) ----------
function EnVivoControl({ capitulos }) {
  const [queue, setQueue] = useState([])
  const [startedAt, setStartedAt] = useState(null)
  const [agregar, setAgregar] = useState('')

  useEffect(() => {
    const unsub = onValue(ref(db, 'enVivo'), (snap) => {
      const val = snap.val()
      setQueue(val?.queue || [])
      setStartedAt(val?.startedAt || null)
    })
    return () => unsub()
  }, [])

  const guardarQueue = (nuevaQueue) => {
    set(ref(db, 'enVivo'), {
      queue: nuevaQueue,
      startedAt: startedAt || Date.now(),
    })
  }

  const agregarCapitulo = () => {
    if (!agregar) return
    guardarQueue([...queue, agregar])
    setAgregar('')
  }

  const quitar = (index) => {
    guardarQueue(queue.filter((_, i) => i !== index))
  }

  const mover = (index, dir) => {
    const nueva = [...queue]
    const destino = index + dir
    if (destino < 0 || destino >= nueva.length) return
    ;[nueva[index], nueva[destino]] = [nueva[destino], nueva[index]]
    guardarQueue(nueva)
  }

  const reiniciarHorario = () => {
    set(ref(db, 'enVivo'), { queue, startedAt: Date.now() })
  }

  const terminar = async () => {
    await remove(ref(db, 'enVivo'))
    setQueue([])
    setStartedAt(null)
  }

  const tituloDe = (id) => capitulos.find((c) => c.id === id)?.titulo || '(eliminado)'

  return (
    <div className="admin-form-block">
      <p className="admin-status">
        Estado actual:{' '}
        {queue.length > 0 ? '🔴 En vivo, reproduciendo en cola' : '⚪ Sin transmisión'}
      </p>

      <div className="admin-form-row">
        <select value={agregar} onChange={(e) => setAgregar(e.target.value)}>
          <option value="">— Elegir capítulo para agregar a la cola —</option>
          {capitulos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titulo}
            </option>
          ))}
        </select>
        <button type="button" onClick={agregarCapitulo}>
          Agregar a la cola
        </button>
      </div>

      {queue.length > 0 ? (
        <ul className="admin-list">
          {queue.map((id, i) => (
            <li key={`${id}-${i}`}>
              <span>
                {i + 1}. {tituloDe(id)}
              </span>
              <span className="admin-list-actions">
                <button onClick={() => mover(i, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button onClick={() => mover(i, 1)} disabled={i === queue.length - 1}>
                  ↓
                </button>
                <button onClick={() => quitar(i)}>Quitar</button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-empty">La cola está vacía.</p>
      )}

      {queue.length > 0 && (
        <>
          <button className="admin-cancel" onClick={reiniciarHorario}>
            Reiniciar horario (empezar desde el primero, ahora)
          </button>
          <button className="admin-danger" onClick={terminar}>
            Terminar transmisión
          </button>
        </>
      )}
    </div>
  )
}

// ---------- Lista con botones de editar/eliminar, reutilizable ----------
function ListaConEliminar({ path, items, renderLabel, onEdit }) {
  const eliminar = (id) => remove(ref(db, `${path}/${id}`))

  if (items.length === 0) {
    return <p className="admin-empty">Sin elementos todavía.</p>
  }

  return (
    <ul className="admin-list">
      {items.map((item) => (
        <li key={item.id}>
          <span>{renderLabel(item)}</span>
          <span className="admin-list-actions">
            {onEdit && (
              <button onClick={() => onEdit(item)}>Editar</button>
            )}
            <button onClick={() => eliminar(item.id)}>Eliminar</button>
          </span>
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
  const [editandoNoticia, setEditandoNoticia] = useState(null)
  const [editandoCapitulo, setEditandoCapitulo] = useState(null)

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
          <NoticiaForm
            editing={editandoNoticia}
            onDone={() => setEditandoNoticia(null)}
          />
          <ListaConEliminar
            path="noticias"
            items={noticias}
            renderLabel={(n) => `${n.titulo} — ${n.tag}`}
            onEdit={setEditandoNoticia}
          />
        </section>
      )}

      {tab === 'capitulos' && (
        <section>
          <CapituloForm
            editing={editandoCapitulo}
            onDone={() => setEditandoCapitulo(null)}
          />
          <ListaConEliminar
            path="capitulos"
            items={capitulos}
            renderLabel={(c) =>
              `${c.titulo} — ${c.tipo || 'Capítulo'}${c.duracion ? ' · ' + c.duracion : ''}${c.video ? ' 🎬' : ''}${c.miniatura ? ' 🖼️' : ''}`
            }
            onEdit={setEditandoCapitulo}
          />
        </section>
      )}

      {tab === 'envivo' && (
        <section>
          <EnVivoControl capitulos={capitulos} />
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
