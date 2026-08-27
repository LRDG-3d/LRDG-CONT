import { useState, useRef } from 'react'

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

  if (!video || !video.trim()) {
    return <p className="admin-hint">Pega la URL del video para poder elegir el fotograma.</p>
  }

  const onSeekChange = (e) => {
    const v = Number(e.target.value)
    setTiempo(v)
    if (videoRef.current) videoRef.current.currentTime = v
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
          'No se pudo capturar el fotograma (posible restricción CORS del servidor de video).'
        )
      )
    }
  }

  return (
    <div className="miniatura-selector">
      <video
        ref={videoRef}
        src={video}
        crossOrigin="anonymous"
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => setDuracion(e.currentTarget.duration || 0)}
        onSeeking={() => setBuscando(true)}
        onSeeked={() => setBuscando(false)}
      />
      <input
        type="range"
        className="miniatura-selector-seek"
        min="0"
        max={duracion || 0}
        step="0.1"
        value={tiempo}
        onChange={onSeekChange}
      />
      <div className="miniatura-selector-row">
        <span className="miniatura-selector-time">
          {formatT(tiempo)} / {formatT(duracion)}
        </span>
        <button type="button" onClick={capturar} disabled={buscando}>
          {buscando ? 'Buscando…' : 'Usar este fotograma'}
        </button>
      </div>
    </div>
  )
}
