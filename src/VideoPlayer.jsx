import { useState, useRef, useEffect } from 'react'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function VideoPlayer({ src, poster, titulo, live, startOffset, onEnded }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const hideTimer = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setCargando(true)
  }, [src])

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const scheduleHide = () => {
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
  }

  const wakeControls = () => {
    setShowControls(true)
    scheduleHide()
  }

  useEffect(() => {
    scheduleHide()
    return () => clearTimeout(hideTimer.current)
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
    wakeControls()
  }

  const onSeek = (e) => {
    if (live) return // en vivo: no se permite adelantar/atrasar
    const v = videoRef.current
    if (!v) return
    const value = Number(e.target.value)
    v.currentTime = value
    setCurrent(value)
    wakeControls()
  }

  // Evita saltar con las flechas del teclado mientras está en vivo
  const onKeyDown = (e) => {
    if (live && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault()
    }
  }

  const onLoadedMetadata = (e) => {
    setDuration(e.currentTarget.duration)
    if (live && startOffset) {
      e.currentTarget.currentTime = startOffset
    }
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen?.()
    }
    wakeControls()
  }

  return (
    <div
      className="glass-player"
      ref={containerRef}
      onMouseMove={wakeControls}
      onTouchStart={wakeControls}
      style={poster ? { backgroundImage: `url(${poster})` } : undefined}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        autoPlay
        onClick={wakeControls}
        onKeyDown={onKeyDown}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={onEnded}
        onCanPlay={() => setCargando(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={onLoadedMetadata}
      />

      {cargando && (
        <div className="glass-loading">
          <span className="glass-spinner" />
          {titulo && <span className="glass-loading-title">{titulo}</span>}
        </div>
      )}

      <div className={`glass-controls ${showControls ? '' : 'glass-controls-hidden'}`}>
        <button
          className="glass-btn"
          onClick={togglePlay}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {live ? (
          <span className="glass-live-tag">🔴 EN VIVO</span>
        ) : (
          <>
            <span className="glass-time">{formatTime(current)}</span>
            <input
              className="glass-seek"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={current}
              style={{
                background: `linear-gradient(to right, #e21b3c ${
                  duration ? (current / duration) * 100 : 0
                }%, #bebcbd 0)`,
              }}
              onChange={onSeek}
            />
            <span className="glass-time">{formatTime(duration)}</span>
          </>
        )}

        <button
          className="glass-btn"
          onClick={toggleFullscreen}
          aria-label="Pantalla completa"
        >
          {isFullscreen ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M9 9H4V7h3V4h2v5zM15 9V4h2v3h3v2h-5zM9 15v5H7v-3H4v-2h5zM15 15h5v2h-3v3h-2v-5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M4 4h6v2H6v4H4V4zM14 4h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zM18 14h2v6h-6v-2h4v-4z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
