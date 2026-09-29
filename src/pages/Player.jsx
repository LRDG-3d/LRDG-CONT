import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSeasons } from "../context/SeasonsContext.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { saveProgress, getProgressFor } from "../utils/progress.js";
import { parseEpisodeNumberFromSlug } from "../utils/episodeSlug.js";

function isEmbeddable(url) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url || "");
}

function toEmbedUrl(url) {
  const yt = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

export default function Player() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { seasons, loading } = useSeasons();
  const [shareMessage, setShareMessage] = useState("");
  const [iframeLoading, setIframeLoading] = useState(true);

  const episodeNumber = parseEpisodeNumberFromSlug(slug);
  const season = seasons.find((s) =>
    s.episodes.some((e) => e.number === episodeNumber)
  );
  const episode = season?.episodes.find((e) => e.number === episodeNumber);

  useEffect(() => {
    if (!season || !episode) return;
    const existing = getProgressFor(season.id, episode.id);
    if (existing === 0) saveProgress(season.id, episode.id, 0.02);
  }, [season, episode]);

  useEffect(() => {
    if (!episode?.videoUrl) return;
    // En pantallas grandes (PC/tablet) no forzamos pantalla completa ni
    // horizontal — eso solo tiene sentido en celular.
    if (window.innerWidth >= 1024) return;

    const el = document.documentElement;

    (async () => {
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
      } catch {
        // el navegador no lo permitió (normal fuera de la app instalada)
      }
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock("landscape");
        }
      } catch {
        // el bloqueo de orientación no está disponible en este navegador
      }
    })();

    return () => {
      (async () => {
        try {
          // primero fuerza un salto a vertical al salir...
          if (screen.orientation?.lock) {
            await screen.orientation.lock("portrait");
          }
        } catch {
          /* no-op */
        }
        try {
          // ...y luego libera el bloqueo, para que si el usuario tiene
          // rotación automática activada, el teléfono vuelva a seguirla.
          screen.orientation?.unlock?.();
        } catch {
          /* no-op */
        }
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
        } catch {
          /* no-op */
        }
      })();
    };
  }, [episode?.videoUrl]);

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: episode.title,
      text: `${episode.title} — Episodio ${episode.number}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // el usuario canceló el share nativo, no hacemos nada más
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Enlace copiado");
      setTimeout(() => setShareMessage(""), 1800);
    } catch {
      setShareMessage("No se pudo copiar el enlace");
      setTimeout(() => setShareMessage(""), 1800);
    }
  }

  if (loading) {
    return (
      <div className="player-full player-full--message spinner-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!season || !episode) {
    return (
      <div className="player-full player-full--message">
        <p>No se encontró ese episodio.</p>
        <Link to="/" className="player-full__back">
          ← Volver
        </Link>
      </div>
    );
  }

  if (!episode.videoUrl) {
    return (
      <div className="player-full player-full--message">
        <p className="player-full__empty">
          Este episodio todavía no tiene URL de video.
        </p>
        <Link to="/" className="player-full__back">
          ← Volver
        </Link>
      </div>
    );
  }

  if (isEmbeddable(episode.videoUrl)) {
    return (
      <div className="player-full">
        <div className="vp__topbar vp__topbar--embed">
          <button
            type="button"
            className="vp__back"
            onClick={() => navigate(-1)}
          >
            ← <span className="vp__title">{episode.title}</span>
          </button>
          <div className="vp__topbar-right">
            <button
              type="button"
              className="vp__icon-btn"
              onClick={handleShare}
              aria-label="Compartir episodio"
            >
              <ShareIcon />
            </button>
            <span className="vp__episode-tag">Episodio {episode.number}</span>
          </div>
        </div>
        {shareMessage && <div className="vp__toast">{shareMessage}</div>}
        {iframeLoading && (
          <div className="spinner-overlay">
            <div className="spinner" />
          </div>
        )}
        <iframe
          className="player-full__media"
          src={toEmbedUrl(episode.videoUrl)}
          title={episode.title}
          allowFullScreen
          onLoad={() => setIframeLoading(false)}
        />
      </div>
    );
  }

  return (
    <div className="player-full">
      <VideoPlayer
        src={episode.videoUrl}
        title={episode.title}
        episodeNumber={episode.number}
        onBack={() => navigate(-1)}
        onEpisodeList={() => navigate(`/temporada/${season.id}`)}
        onShare={handleShare}
        shareMessage={shareMessage}
        onTimeUpdate={(currentTime, duration) => {
          if (!duration) return;
          saveProgress(season.id, episode.id, currentTime / duration);
        }}
        onEnded={() => saveProgress(season.id, episode.id, 1)}
      />
    </div>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none">
      <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
