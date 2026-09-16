import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
import { ref, push, set, remove, onValue } from 'firebase/database'
import { auth, db } from './firebase'
import { archivoAMiniatura } from './thumbnailCapture.js'
<<<<<<< HEAD
=======
import { subirAArchiveOrg } from './iaUpload.js'
>>>>>>> d9b9d90 (Agregar carpetas de estreno para programar varios capitulos juntos)
import { formatFechaEstreno } from './estreno.js'
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
  const [subtitulo, setSubtitulo] = useState('')
  const [tag, setTag] = useState('')
  const [autor, setAutor] = useState('')
  const [autorImagen, setAutorImagen] = useState('')
  const [imagen, setImagen] = useState('')
  const [imagenCredito, setImagenCredito] = useState('')
  const [contenido, setContenido] = useState('')

  useEffect(() => {
    setTitulo(editing?.titulo || '')
    setSubtitulo(editing?.subtitulo || '')
    setTag(editing?.tag || '')
    setAutor(editing?.autor || '')
    setAutorImagen(editing?.autorImagen || '')
    setImagen(editing?.imagen || '')
    setImagenCredito(editing?.imagenCredito || '')
    setContenido(editing?.contenido || '')
  }, [editing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return

    const datosComunes = {
      titulo,
      subtitulo: subtitulo.trim(),
      tag: tag || 'General',
      autor: autor.trim(),
      autorImagen: autorImagen.trim(),
      imagen: imagen.trim(),
      imagenCredito: imagenCredito.trim(),
      contenido: contenido.trim(),
    }

    if (editing) {
      await set(ref(db, `noticias/${editing.id}`), {
        ...editing,
        ...datosComunes,
      })
    } else {
      const nuevaRef = push(ref(db, 'noticias'))
      await set(nuevaRef, {
        ...datosComunes,
        fecha: new Date().toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      })
    }
    setTitulo('')
    setSubtitulo('')
    setTag('')
    setAutor('')
    setAutorImagen('')
    setImagen('')
    setImagenCredito('')
    setContenido('')
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form admin-form-stacked">
      <input
        placeholder="Título de la noticia"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <input
        placeholder="Subtítulo o bajada (opcional)"
        value={subtitulo}
        onChange={(e) => setSubtitulo(e.target.value)}
      />
      <input
        placeholder="Etiqueta (ej. Entretenimiento)"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      />
      <div className="admin-form-row">
        <input
          placeholder="Nombre del autor (opcional)"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
        />
        <input
          placeholder="URL de la foto del autor (opcional)"
          value={autorImagen}
          onChange={(e) => setAutorImagen(e.target.value)}
        />
      </div>
      <input
        placeholder="URL de la imagen principal"
        value={imagen}
        onChange={(e) => setImagen(e.target.value)}
      />
      <input
        placeholder="Crédito de la imagen (ej. Imagen: Televisa)"
        value={imagenCredito}
        onChange={(e) => setImagenCredito(e.target.value)}
      />
      <textarea
        placeholder="Contenido completo de la noticia (usa saltos de línea para separar párrafos)"
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        rows={6}
      />
      <div className="admin-form-row">
        <button type="submit">
          {editing ? 'Guardar cambios' : 'Agregar noticia'}
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

// ---------- Formulario para agregar/editar un capítulo ----------
function timestampAInput(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

function CapituloForm({ editing, onDone }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [miniatura, setMiniatura] = useState('')
  const [video, setVideo] = useState('')
  const [duracion, setDuracion] = useState('')
  const [detectandoDuracion, setDetectandoDuracion] = useState(false)
  const [tipo, setTipo] = useState('Capítulo')
  const [estrenoEn, setEstrenoEn] = useState('')
  const [errorCaptura, setErrorCaptura] = useState('')
  const [guardando, setGuardando] = useState(false)
<<<<<<< HEAD
=======
  const [identifierIA, setIdentifierIA] = useState('')
  const [subiendoIA, setSubiendoIA] = useState(false)
>>>>>>> d9b9d90 (Agregar carpetas de estreno para programar varios capitulos juntos)

  useEffect(() => {
    setTitulo(editing?.titulo || '')
    setDescripcion(editing?.descripcion || '')
    setMiniatura(editing?.miniatura || '')
    setVideo(editing?.video || '')
    setDuracion(editing?.duracion || '')
    setTipo(editing?.tipo || 'Capítulo')
    setEstrenoEn(timestampAInput(editing?.estrenoEn))
    setErrorCaptura('')
  }, [editing])

  // Detecta la duración real del video leyendo sus metadatos, sin
  // necesidad de que la persona la escriba a mano.
  const detectarDuracion = (url) => {
    if (!url.trim()) {
      setDuracion('')
      return
    }
    setDetectandoDuracion(true)
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.onloadedmetadata = () => {
      const total = Math.round(v.duration)
      const m = Math.floor(total / 60)
      const s = total % 60
      setDuracion(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      setDetectandoDuracion(false)
    }
    v.onerror = () => setDetectandoDuracion(false)
    v.src = url.trim()
  }

  const subirImagen = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorCaptura('')
    try {
      const dataUrl = await archivoAMiniatura(file)
      setMiniatura(dataUrl)
    } catch (err) {
      setErrorCaptura(err.message || 'No se pudo procesar la imagen.')
    } finally {
      e.target.value = ''
    }
  }

  const subirImagenAIA = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!identifierIA.trim()) {
      setErrorCaptura('Escribe primero el identificador del item de Internet Archive.')
      e.target.value = ''
      return
    }
    setErrorCaptura('')
    setSubiendoIA(true)
    try {
      const url = await subirAArchiveOrg(file, identifierIA.trim())
      setMiniatura(url)
    } catch (err) {
      setErrorCaptura(err.message || 'No se pudo subir la imagen a Internet Archive.')
    } finally {
      setSubiendoIA(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo.trim() || guardando) return
    setGuardando(true)

    const datos = {
      titulo,
      descripcion: descripcion.trim(),
      miniatura: miniatura.trim(),
      video: video.trim(),
      duracion: duracion.trim(),
      tipo,
      creadoEn: editing?.creadoEn || Date.now(),
      estrenoEn: estrenoEn ? new Date(estrenoEn).getTime() : null,
    }

    try {
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
      setEstrenoEn('')
      onDone?.()
    } catch (err) {
      setErrorCaptura('No se pudo guardar el capítulo. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
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
        onBlur={(e) => detectarDuracion(e.target.value)}
      />
      <p className="admin-hint">
        {detectandoDuracion
          ? 'Detectando duración del video…'
          : duracion
          ? `Duración detectada: ${duracion}`
          : 'La duración se detecta automáticamente al salir del campo de video.'}
      </p>
      <div className="admin-form-row">
        <input
          placeholder="URL de la miniatura (o sube/genera una)"
          value={miniatura}
          onChange={(e) => setMiniatura(e.target.value)}
        />
        <label className="admin-file-btn">
          📷 Subir imagen
          <input type="file" accept="image/*" onChange={subirImagen} hidden />
        </label>
      </div>
      <div className="admin-form-row">
        <input
          placeholder="Identificador del item en Internet Archive"
          value={identifierIA}
          onChange={(e) => setIdentifierIA(e.target.value)}
        />
        <label className="admin-file-btn">
          {subiendoIA ? 'Subiendo…' : '☁️ Subir a Internet Archive'}
          <input
            type="file"
            accept="image/*"
            onChange={subirImagenAIA}
            disabled={subiendoIA}
            hidden
          />
        </label>
      </div>
      <p className="admin-hint">
        Toma una captura de pantalla del momento que quieras del video (desde
        tu galería o el reproductor) y súbela aquí, o pega la URL de una
        imagen ya existente arriba. También puedes escribir el identificador
        de tu item (ej. LRDG-WEB-20260826) y subirla directo a Internet
        Archive.
      </p>
      {errorCaptura && <p className="admin-error">{errorCaptura}</p>}
      {miniatura && (
        <img src={miniatura} alt="Vista previa de la miniatura" className="admin-thumb-preview" />
      )}
      <label className="admin-hint" htmlFor="estrenoEn">
        Fecha y hora de estreno (opcional)
      </label>
      <input
        id="estrenoEn"
        type="datetime-local"
        value={estrenoEn}
        onChange={(e) => setEstrenoEn(e.target.value)}
      />
      <p className="admin-hint">
        {estrenoEn
          ? 'No aparecerá en el sitio público hasta esa fecha y hora.'
          : 'Si lo dejas vacío, el capítulo se muestra de inmediato.'}
      </p>
      <div className="admin-form-row">
        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar capítulo'}
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

// ---------- Control de "NO TE PIERDAS DE VER ESTOS CAPÍTULOS" (destacados) ----------
function DestacadosControl({ capitulos }) {
  const [queue, setQueue] = useState([])
  const [agregar, setAgregar] = useState('')

  useEffect(() => {
    const unsub = onValue(ref(db, 'destacados'), (snap) => {
      setQueue(snap.val() || [])
    })
    return () => unsub()
  }, [])

  const guardar = (nueva) => set(ref(db, 'destacados'), nueva)

  const agregarCapitulo = () => {
    if (!agregar || queue.includes(agregar)) return
    guardar([...queue, agregar])
    setAgregar('')
  }

  const quitar = (index) => guardar(queue.filter((_, i) => i !== index))

  const mover = (index, dir) => {
    const nueva = [...queue]
    const destino = index + dir
    if (destino < 0 || destino >= nueva.length) return
    ;[nueva[index], nueva[destino]] = [nueva[destino], nueva[index]]
    guardar(nueva)
  }

  const tituloDe = (id) => capitulos.find((c) => c.id === id)?.titulo || '(eliminado)'

  return (
    <div className="admin-form-block">
      <p className="admin-hint">
        Elige capítulos ya existentes para mostrarlos en la sección
        "Lo mejor de La Rosa" dentro de la página principal
        capítulo.
      </p>

      <div className="admin-form-row">
        <select value={agregar} onChange={(e) => setAgregar(e.target.value)}>
          <option value="">— Elegir capítulo para agregar —</option>
          {capitulos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titulo}
            </option>
          ))}
        </select>
        <button type="button" onClick={agregarCapitulo}>
          Agregar
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
        <p className="admin-empty">Todavía no hay capítulos destacados.</p>
      )}
    </div>
  )
}

<<<<<<< HEAD
=======
// ---------- Carpetas de estreno: agrupan varios capítulos bajo una
// misma fecha/hora, para que se estrenen todos juntos ----------
function CarpetasControl({ capitulos }) {
  const [carpetas, setCarpetas] = useState([])
  const [nombre, setNombre] = useState('')
  const [fechaHora, setFechaHora] = useState('')
  const [agregarPorCarpeta, setAgregarPorCarpeta] = useState({})

  useEffect(() => {
    const unsub = onValue(ref(db, 'carpetas'), (snap) => {
      const val = snap.val() || {}
      setCarpetas(Object.entries(val).map(([id, c]) => ({ id, ...c })))
    })
    return () => unsub()
  }, [])

  const crearCarpeta = async (e) => {
    e.preventDefault()
    if (!nombre.trim() || !fechaHora) return
    const nuevaRef = push(ref(db, 'carpetas'))
    await set(nuevaRef, {
      nombre: nombre.trim(),
      fechaHora: new Date(fechaHora).getTime(),
    })
    setNombre('')
    setFechaHora('')
  }

  const eliminarCarpeta = async (carpeta) => {
    const miembros = capitulos.filter((c) => c.carpetaId === carpeta.id)
    await Promise.all(
      miembros.map((c) =>
        set(ref(db, `capitulos/${c.id}`), { ...c, carpetaId: null, estrenoEn: null })
      )
    )
    await remove(ref(db, `carpetas/${carpeta.id}`))
  }

  const cambiarFecha = async (carpeta, nuevaFechaHoraStr) => {
    if (!nuevaFechaHoraStr) return
    const nuevoTs = new Date(nuevaFechaHoraStr).getTime()
    await set(ref(db, `carpetas/${carpeta.id}/fechaHora`), nuevoTs)
    const miembros = capitulos.filter((c) => c.carpetaId === carpeta.id)
    await Promise.all(
      miembros.map((c) => set(ref(db, `capitulos/${c.id}/estrenoEn`), nuevoTs))
    )
  }

  const agregarCapituloACarpeta = async (carpeta) => {
    const capId = agregarPorCarpeta[carpeta.id]
    if (!capId) return
    await set(ref(db, `capitulos/${capId}/carpetaId`), carpeta.id)
    await set(ref(db, `capitulos/${capId}/estrenoEn`), carpeta.fechaHora)
    setAgregarPorCarpeta((prev) => ({ ...prev, [carpeta.id]: '' }))
  }

  const quitarDeCarpeta = async (capId) => {
    await set(ref(db, `capitulos/${capId}/carpetaId`), null)
    await set(ref(db, `capitulos/${capId}/estrenoEn`), null)
  }

  return (
    <div className="admin-form-block">
      <p className="admin-hint">
        Crea una carpeta con una fecha y hora, y agrégale los capítulos que
        quieras que se estrenen todos juntos en ese momento. Si cambias la
        fecha de la carpeta, se actualiza en todos los capítulos que tenga
        adentro.
      </p>

      <form onSubmit={crearCarpeta} className="admin-form admin-form-stacked">
        <input
          placeholder="Nombre de la carpeta (ej. Estreno de temporada 3)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="datetime-local"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
        />
        <button type="submit">Crear carpeta</button>
      </form>

      {carpetas.length === 0 && (
        <p className="admin-empty">Todavía no hay carpetas de estreno.</p>
      )}

      {carpetas.map((carpeta) => {
        const miembros = capitulos.filter((c) => c.carpetaId === carpeta.id)
        const disponibles = capitulos.filter((c) => c.carpetaId !== carpeta.id)
        return (
          <div key={carpeta.id} className="admin-carpeta">
            <div className="admin-carpeta-head">
              <strong>{carpeta.nombre}</strong>
              <button className="admin-cancel" onClick={() => eliminarCarpeta(carpeta)}>
                Eliminar carpeta
              </button>
            </div>
            <div className="admin-form-row">
              <input
                type="datetime-local"
                defaultValue={timestampAInput(carpeta.fechaHora)}
                onBlur={(e) => cambiarFecha(carpeta, e.target.value)}
              />
              <span className="admin-hint">{formatFechaEstreno(carpeta.fechaHora)}</span>
            </div>

            <div className="admin-form-row">
              <select
                value={agregarPorCarpeta[carpeta.id] || ''}
                onChange={(e) =>
                  setAgregarPorCarpeta((prev) => ({ ...prev, [carpeta.id]: e.target.value }))
                }
              >
                <option value="">— Elegir capítulo para agregar —</option>
                {disponibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => agregarCapituloACarpeta(carpeta)}>
                Agregar
              </button>
            </div>

            {miembros.length > 0 ? (
              <ul className="admin-list">
                {miembros.map((c) => (
                  <li key={c.id}>
                    <span>{c.titulo}</span>
                    <button onClick={() => quitarDeCarpeta(c.id)}>Quitar</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-empty">Esta carpeta todavía no tiene capítulos.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

>>>>>>> d9b9d90 (Agregar carpetas de estreno para programar varios capitulos juntos)
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

// ---------- Moderación de comentarios ----------
function ModeracionComentarios() {
  const [comentarios, setComentarios] = useState([])

  useEffect(() => {
    const unsub = onValue(ref(db, 'comentarios'), (snap) => {
      const val = snap.val() || {}
      const lista = []
      Object.entries(val).forEach(([grupo, items]) => {
        Object.entries(items || {}).forEach(([id, c]) => {
          lista.push({ grupo, id, ...c })
        })
      })
      lista.sort((a, b) => (b.fecha || 0) - (a.fecha || 0))
      setComentarios(lista)
    })
    return () => unsub()
  }, [])

  const eliminar = (grupo, id) => remove(ref(db, `comentarios/${grupo}/${id}`))

  if (comentarios.length === 0) {
    return <p className="admin-empty">No hay comentarios todavía.</p>
  }

  return (
    <ul className="admin-list">
      {comentarios.map((c) => (
        <li key={`${c.grupo}-${c.id}`}>
          <span>
            <strong>{c.nombre}:</strong> {c.texto}
            <br />
            <span className="admin-hint">{c.grupo}</span>
          </span>
          <button onClick={() => eliminar(c.grupo, c.id)}>Eliminar</button>
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
        <button
          className={tab === 'destacados' ? 'active' : ''}
          onClick={() => setTab('destacados')}
        >
          Destacados
        </button>
        <button
<<<<<<< HEAD
=======
          className={tab === 'carpetas' ? 'active' : ''}
          onClick={() => setTab('carpetas')}
        >
          Carpetas
        </button>
        <button
>>>>>>> d9b9d90 (Agregar carpetas de estreno para programar varios capitulos juntos)
          className={tab === 'comentarios' ? 'active' : ''}
          onClick={() => setTab('comentarios')}
        >
          Comentarios
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

          {capitulos.some((c) => c.estrenoEn && c.estrenoEn > Date.now()) && (
            <>
              <h3 className="admin-subheading">
                🕒 Próximamente (solo visible aquí, no en el sitio público)
              </h3>
              <ListaConEliminar
                path="capitulos"
                items={capitulos.filter((c) => c.estrenoEn && c.estrenoEn > Date.now())}
                renderLabel={(c) =>
                  `${c.titulo} — Se estrena: ${formatFechaEstreno(c.estrenoEn)}`
                }
                onEdit={setEditandoCapitulo}
              />
            </>
          )}

          <h3 className="admin-subheading">Publicados</h3>
          <ListaConEliminar
            path="capitulos"
            items={capitulos.filter((c) => !c.estrenoEn || c.estrenoEn <= Date.now())}
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

      {tab === 'destacados' && (
        <section>
          <DestacadosControl capitulos={capitulos} />
        </section>
      )}

<<<<<<< HEAD
=======
      {tab === 'carpetas' && (
        <section>
          <CarpetasControl capitulos={capitulos} />
        </section>
      )}

>>>>>>> d9b9d90 (Agregar carpetas de estreno para programar varios capitulos juntos)
      {tab === 'comentarios' && (
        <section>
          <ModeracionComentarios />
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
