import { useState, useRef, useEffect } from 'react'

function formatT(seconds) {
  if (!Number.isFinite(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Muestra el video con una barra para moverse a cualquier punto y un botón
// para capturar exactamente ese fotograma como miniatura.
export default function MiniaturaSelector({ video, onCapture }) {
  const videoRef = useRef(null)
  const [duracion, setDuracion] = useState(0)
  const [tiempo, setTiempo] = useState(0)
  const [buscando, setBuscando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  // Primero intenta con crossOrigin (necesario para poder capturar el
  // fotograma). Si el servidor no lo permite, reintenta sin él para que
  // al menos se pueda previsualizar y mover la barra.
  const [conCrossOrigin, setConCrossOrigin] = useState(true)

  // Si cambia la URL del video, reinicia todo el estado
  useEffect(() => {
    setDuracion(0)
    setTiempo(0)
    setCargando(true)
    setErrorCarga('')
    setConCrossOrigin(true)
  }, [video])

  if (!video || !video.trim()) {
    return <p className="admin-hint">Pega la URL del video para poder elegir el fotograma.</p>
  }

  const onSeekChange = (e) => {
    const v = Number(e.target.value)
    setTiempo(v)
    if (videoRef.current) videoRef.current.currentTime = v
  }

  const onLoadedMetadata = (e) => {
    setDuracion(e.currentTarget.duration || 0)
    setCargando(false)
    setErrorCarga('')
  }

  const onVideoError = () => {
    if (conCrossOrigin) {
      // Reintenta sin crossOrigin: se podrá ver y mover la barra, aunque
      // la captura del fotograma podría fallar más adelante por CORS.
      setConCrossOrigin(false)
      setCargando(true)
    } else {
      setCargando(false)
      setErrorCarga(
        'No se pudo cargar este video para previsualizarlo. Revisa que la URL sea correcta y abra directamente en el navegador.'
      )
    }
  }

  const capturar = () => {
    const v = videoRef.current
    if (!v) return
    try {
      const canvas = document.createElement('canvas')
      canvas.width = v.videoWidth
      canvas.height = v.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      onCapture(dataUrl, null)
    } catch (err) {
      onCapture(
        null,
        new Error(
          'No se pudo capturar el fotograma por una restricción CORS de este servidor de video. Puedes usar "Aleatoria" con otro video, o pegar una URL de imagen manualmente.'
        )
      )
    }
  }

  return (
    <div className="miniatura-selector">
      <video
        key={conCrossOrigin ? 'cors' : 'nocors'}
        ref={videoRef}
        src={video}
        crossOrigin={conCrossOrigin ? 'anonymous' : undefined}
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={onLoadedMetadata}
        onError={onVideoError}
        onSeeking={() => setBuscando(true)}
        onSeeked={() => setBuscando(false)}
      />
      {cargando && !errorCarga && (
        <p className="admin-hint">Cargando video…</p>
      )}
      {errorCarga && <p className="admin-error">{errorCarga}</p>}
      <input
        type="range"
        className="miniatura-selector-seek"
        min="0"
        max={duracion || 0}
        step="0.1"
        value={tiempo}
        disabled={cargando || !!errorCarga}
        onChange={onSeekChange}
      />
      <div className="miniatura-selector-row">
        <span className="miniatura-selector-time">
          {formatT(tiempo)} / {formatT(duracion)}
        </span>
        <button
          type="button"
          onClick={capturar}
          disabled={buscando || cargando || !!errorCarga}
        >
          {buscando ? 'Buscando…' : 'Usar este fotograma'}
        </button>
      </div>
    </div>
  )
}
