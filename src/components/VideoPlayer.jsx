import { useEffect, useRef, useState } from "react";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00:00";
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function VideoPlayer({
  src,
  title,
  episodeNumber,
  onBack,
  onEpisodeList,
  onTimeUpdate,
  onEnded,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);

  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  function scheduleHide() {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, 3500);
  }

  function showControls() {
    setControlsVisible(true);
    scheduleHide();
  }

  useEffect(() => {
    scheduleHide();
    return () => clearTimeout(hideTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
    showControls();
  }

  function skip(seconds) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(
      Math.max(0, v.currentTime + seconds),
      v.duration || Infinity
    );
    showControls();
  }

  function handleSeek(e) {
    const v = videoRef.current;
    if (!v) return;
    const value = Number(e.target.value);
    v.currentTime = value;
    setCurrentTime(value);
    showControls();
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    showControls();
  }

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
    showControls();
  }

  return (
    <div
      className="vp"
      ref={containerRef}
      onClick={(e) => {
        if (e.target === containerRef.current || e.target.tagName === "VIDEO") {
          controlsVisible ? togglePlay() : showControls();
        }
      }}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      <video
        ref={videoRef}
        className="vp__video"
        src={src}
        autoPlay
        playsInline
        onTimeUpdate={(e) => {
          setCurrentTime(e.target.currentTime);
          onTimeUpdate?.(e.target.currentTime, e.target.duration);
        }}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={onEnded}
      />

      <div className={`vp__overlay ${controlsVisible ? "" : "vp__overlay--hidden"}`}>
        <div className="vp__topbar">
          <button type="button" className="vp__back" onClick={onBack}>
            <ChevronLeft />
            <span className="vp__title">{title}</span>
          </button>
          {episodeNumber != null && (
            <span className="vp__episode-tag">Episodio {episodeNumber}</span>
          )}
        </div>

        <div className="vp__controls">
          <div className="vp__progress">
            <span className="vp__time">{formatTime(currentTime)}</span>
            <input
              className="vp__range"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              style={{
                "--vp-progress": duration
                  ? `${(currentTime / duration) * 100}%`
                  : "0%",
              }}
            />
            <span className="vp__time">{formatTime(duration)}</span>
          </div>

          <div className="vp__buttons">
            <button
              type="button"
              className="vp__icon-btn"
              onClick={togglePlay}
              aria-label={playing ? "Pausar" : "Reproducir"}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              type="button"
              className="vp__icon-btn"
              onClick={onEpisodeList}
              aria-label="Ver episodios"
            >
              <ListIcon />
            </button>

            <button
              type="button"
              className="vp__icon-btn"
              onClick={() => skip(-15)}
              aria-label="Retroceder 15 segundos"
            >
              <Rewind15 />
            </button>

            <button
              type="button"
              className="vp__icon-btn"
              onClick={() => skip(15)}
              aria-label="Adelantar 15 segundos"
            >
              <Forward15 />
            </button>

            <button
              type="button"
              className="vp__icon-btn"
              onClick={toggleMute}
              aria-label={muted ? "Activar sonido" : "Silenciar"}
            >
              {muted ? <VolumeOffIcon /> : <VolumeIcon />}
            </button>

            <span className="vp__spacer" />

            <button
              type="button"
              className="vp__icon-btn"
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
              }
            >
              {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Íconos --------------------------------------------------------------- */

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <rect x="4" y="7" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 5.5h12a1 1 0 0 1 1 1V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function Rewind15() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
      <path
        d="M6.5 5v3.2M6.5 8.2 3.6 6.6M6.5 8.2 9.4 6.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 8.2a8 8 0 1 0 5.9-2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text x="12" y="16.5" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="inherit">
        15
      </text>
    </svg>
  );
}

function Forward15() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
      <path
        d="M17.5 5v3.2M17.5 8.2l2.9-1.6M17.5 8.2l-2.9-1.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 8.2a8 8 0 1 1-5.9-2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text x="12" y="16.5" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="inherit">
        15
      </text>
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      <path
        d="M16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      <path
        d="m16 9 5 6m0-6-5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path
        d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5M4 4l6 6M20 4l-6 6M4 20l6-6M20 20l-6-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path
        d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
