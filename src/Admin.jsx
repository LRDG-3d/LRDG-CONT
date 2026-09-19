import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
import { ref, push, set, remove, onValue } from 'firebase/database'
import { auth, db } from './firebase'
import { archivoAMiniatura } from './thumbnailCapture.js'
import { subirAArchiveOrg } from './iaUpload.js'
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

function CapituloForm({ editing, onDone, temporadaPredeterminada }) {
  const [titulo, setTitulo] = useState('')
  const [numeroEpisodio, setNumeroEpisodio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [miniatura, setMiniatura] = useState('')
  const [video, setVideo] = useState('')
  const [duracion, setDuracion] = useState('')
  const [detectandoDuracion, setDetectandoDuracion] = useState(false)
  const [tipo, setTipo] = useState('Capítulo')
  const [estrenoEn, setEstrenoEn] = useState('')
  const [errorCaptura, setErrorCaptura] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [identifierIA, setIdentifierIA] = useState('')
  const [subiendoIA, setSubiendoIA] = useState(false)
  const [temporadaId, setTemporadaId] = useState('')
  const [temporadas, setTemporadas] = useState([])

  useEffect(() => {
    const unsub = onValue(ref(db, 'temporadas'), (snap) => {
      const val = snap.val() || {}
      setTemporadas(Object.entries(val).map(([id, t]) => ({ id, ...t })))
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    setTitulo(editing?.titulo || '')
    setNumeroEpisodio(editing?.numeroEpisodio || '')
    setDescripcion(editing?.descripcion || '')
    setMiniatura(editing?.miniatura || '')
    setVideo(editing?.video || '')
    setDuracion(editing?.duracion || '')
    setTipo(editing?.tipo || 'Capítulo')
    setEstrenoEn(timestampAInput(editing?.estrenoEn))
    setTemporadaId(editing?.temporadaId || temporadaPredeterminada || '')
    setErrorCaptura('')
  }, [editing, temporadaPredeterminada])

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
      numeroEpisodio: numeroEpisodio.toString().trim(),
      descripcion: descripcion.trim(),
      miniatura: miniatura.trim(),
      video: video.trim(),
      duracion: duracion.trim(),
      tipo,
      creadoEn: editing?.creadoEn || Date.now(),
      estrenoEn: estrenoEn ? new Date(estrenoEn).getTime() : null,
      temporadaId: temporadaId || null,
    }

    try {
      if (editing) {
        await set(ref(db, `capitulos/${editing.id}`), datos)
      } else {
        const nuevaRef = push(ref(db, 'capitulos'))
        await set(nuevaRef, datos)
      }

      setTitulo('')
      setNumeroEpisodio('')
      setDescripcion('')
      setMiniatura('')
      setVideo('')
      setDuracion('')
      setTipo('Capítulo')
      setEstrenoEn('')
      setTemporadaId(temporadaPredeterminada || '')
      onDone?.()
    } catch (err) {
      setErrorCaptura('No se pudo guardar el capítulo. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form admin-form-stacked">
      <div className="admin-form-row">
        <input
          placeholder="Título del capítulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <input
          placeholder="N° de episodio (ej. 5)"
          value={numeroEpisodio}
          onChange={(e) => setNumeroEpisodio(e.target.value)}
        />
      </div>
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
        <select value={temporadaId} onChange={(e) => setTemporadaId(e.target.value)}>
          <option value="">— Sin temporada —</option>
          {temporadas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
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

// ---------- Control de Temporadas: crear/eliminar temporadas ----------
function TemporadasControl({ capitulos }) {
  const [temporadas, setTemporadas] = useState([])
  const [nombre, setNombre] = useState('')
  const [imagen, setImagen] = useState('')
  const [descripcion, setDescripcion] = useState('')

  useEffect(() => {
    const unsub = onValue(ref(db, 'temporadas'), (snap) => {
      const val = snap.val() || {}
      setTemporadas(Object.entries(val).map(([id, t]) => ({ id, ...t })))
    })
    return () => unsub()
  }, [])

  const crear = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    const nuevaRef = push(ref(db, 'temporadas'))
    await set(nuevaRef, {
      nombre: nombre.trim(),
      imagen: imagen.trim(),
      descripcion: descripcion.trim(),
      creadoEn: Date.now(),
    })
    setNombre('')
    setImagen('')
    setDescripcion('')
  }

  const eliminar = async (temporada) => {
    const miembros = capitulos.filter((c) => c.temporadaId === temporada.id)
    await Promise.all(
      miembros.map((c) => set(ref(db, `capitulos/${c.id}/temporadaId`), null))
    )
    await remove(ref(db, `temporadas/${temporada.id}`))
  }

  return (
    <div className="admin-form-block">
      <p className="admin-hint">
        Crea las temporadas aquí; luego, al agregar o editar un capítulo,
        eliges a cuál pertenece. El título de la temporada se muestra en su
        página como "La Rosa de Guadalupe {'{nombre}'}".
      </p>
      <form onSubmit={crear} className="admin-form admin-form-stacked">
        <input
          placeholder="Nombre de la temporada (ej. Temporada 1)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          placeholder="URL de imagen destacada (opcional)"
          value={imagen}
          onChange={(e) => setImagen(e.target.value)}
        />
        <textarea
          placeholder="Descripción de la temporada (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
        />
        <button type="submit">Crear temporada</button>
      </form>
      {temporadas.length > 0 ? (
        <ul className="admin-list">
          {temporadas.map((t) => (
            <li key={t.id}>
              <span>{t.nombre}</span>
              <button onClick={() => eliminar(t)}>Eliminar</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-empty">Todavía no hay temporadas creadas.</p>
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
  const [temporadas, setTemporadas] = useState([])
  const [editandoNoticia, setEditandoNoticia] = useState(null)
  const [editandoCapitulo, setEditandoCapitulo] = useState(null)
  const [temporadaSeleccionada, setTemporadaSeleccionada] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    const unsubN = onValue(ref(db, 'noticias'), (s) => setNoticias(toArray(s.val())))
    const unsubC = onValue(ref(db, 'capitulos'), (s) => setCapitulos(toArray(s.val())))
    const unsubT = onValue(ref(db, 'temporadas'), (s) => {
      const val = s.val() || {}
      setTemporadas(Object.entries(val).map(([id, t]) => ({ id, ...t })))
    })
    return () => {
      unsubN()
      unsubC()
      unsubT()
    }
  }, [])

  const abrirNuevo = () => {
    setEditandoCapitulo(null)
    setModalAbierto(true)
  }

  const abrirEdicion = (item) => {
    setEditandoCapitulo(item)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setEditandoCapitulo(null)
    setModalAbierto(false)
  }

  const capitulosFiltrados = temporadaSeleccionada
    ? capitulos.filter((c) => c.temporadaId === temporadaSeleccionada)
    : capitulos

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
          <h3 className="admin-subheading">Temporadas</h3>
          <TemporadasControl capitulos={capitulos} />

          <h3 className="admin-subheading">Episodios</h3>
          <div className="admin-form-row admin-season-bar">
            <select
              value={temporadaSeleccionada}
              onChange={(e) => setTemporadaSeleccionada(e.target.value)}
            >
              <option value="">Todas las temporadas</option>
              {temporadas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
            <button type="button" className="admin-add-btn" onClick={abrirNuevo}>
              + Añadir episodio
            </button>
          </div>

          {modalAbierto && (
            <div className="admin-modal-overlay" onClick={cerrarModal}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <button className="admin-modal-close" onClick={cerrarModal}>
                  ✕
                </button>
                <h3 className="admin-subheading" style={{ marginTop: 0 }}>
                  {editandoCapitulo ? 'Editar episodio' : 'Nuevo episodio'}
                </h3>
                <CapituloForm
                  editing={editandoCapitulo}
                  onDone={cerrarModal}
                  temporadaPredeterminada={temporadaSeleccionada}
                />
              </div>
            </div>
          )}

          {capitulosFiltrados.some((c) => c.estrenoEn && c.estrenoEn > Date.now()) && (
            <>
              <h3 className="admin-subheading">
                🕒 Próximamente (solo visible aquí, no en el sitio público)
              </h3>
              <ListaConEliminar
                path="capitulos"
                items={capitulosFiltrados.filter((c) => c.estrenoEn && c.estrenoEn > Date.now())}
                renderLabel={(c) =>
                  `${c.numeroEpisodio ? `#${c.numeroEpisodio} ` : ''}${c.titulo} — Se estrena: ${formatFechaEstreno(c.estrenoEn)}`
                }
                onEdit={abrirEdicion}
              />
            </>
          )}

          <h3 className="admin-subheading">Publicados</h3>
          <ListaConEliminar
            path="capitulos"
            items={capitulosFiltrados.filter((c) => !c.estrenoEn || c.estrenoEn <= Date.now())}
            renderLabel={(c) =>
              `${c.numeroEpisodio ? `#${c.numeroEpisodio} ` : ''}${c.titulo} — ${c.tipo || 'Capítulo'}${c.duracion ? ' · ' + c.duracion : ''}${c.video ? ' 🎬' : ''}${c.miniatura ? ' 🖼️' : ''}`
            }
            onEdit={abrirEdicion}
          />
        </section>
      )}

      {tab === 'envivo' && (
        <section>
          <EnVivoControl capitulos={capitulos} />
        </section>
      )}

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
