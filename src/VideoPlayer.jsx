import { useState, useRef, useEffect } from 'react'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function VideoPlayer({ src, poster }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
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
  }

  const onSeek = (e) => {
    const v = videoRef.current
    if (!v) return
    const value = Number(e.target.value)
    v.currentTime = value
    setCurrent(value)
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen?.()
    }
  }

  return (
    <div className="glass-player" ref={containerRef}>
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        autoPlay
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      <div className="glass-controls">
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

        <span className="glass-time">{formatTime(current)}</span>

        <input
          className="glass-seek"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={current}
          onChange={onSeek}
        />

        <span className="glass-time">{formatTime(duration)}</span>

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
