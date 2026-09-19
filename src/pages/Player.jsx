import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useSeasons } from "../context/SeasonsContext.jsx";
import { saveProgress, getProgressFor } from "../utils/progress.js";

function isEmbeddable(url) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url || "");
}

function toEmbedUrl(url) {
  const yt = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

export default function Player() {
  const { seasonId, episodeId } = useParams();
  const { seasons, loading } = useSeasons();
  const season = seasons.find((s) => s.id === seasonId);
  const episode = season?.episodes.find((e) => e.id === episodeId);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!season || !episode) return;
    const existing = getProgressFor(season.id, episode.id);
    if (existing === 0) saveProgress(season.id, episode.id, 0.02);
  }, [season, episode]);

  if (loading) {
    return <div className="player">Cargando…</div>;
  }

  if (!season || !episode) {
    return (
      <div className="player">
        <Link to="/" className="player__back">
          ← Volver
        </Link>
        <p>No se encontró ese episodio.</p>
      </div>
    );
  }

  const index = season.episodes.findIndex((e) => e.id === episodeId);
  const prev = season.episodes[index - 1];
  const next = season.episodes[index + 1];

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    saveProgress(season.id, episode.id, v.currentTime / v.duration);
  }

  return (
    <div className="player">
      <Link to="/" className="player__back">
        ← Volver a episodios
      </Link>

      <div className="player__frame">
        {episode.videoUrl ? (
          isEmbeddable(episode.videoUrl) ? (
            <iframe
              src={toEmbedUrl(episode.videoUrl)}
              title={episode.title}
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={episode.videoUrl}
              controls
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => saveProgress(season.id, episode.id, 1)}
            />
          )
        ) : (
          <div className="player__frame-empty">
            Este episodio todavía no tiene URL de video.
          </div>
        )}
      </div>

      <h1 className="player__title">
        {season.title} · Episodio {episode.number} — {episode.title}
      </h1>
      {episode.duration && <p className="player__meta">{episode.duration}</p>}
      {episode.synopsis && (
        <p className="player__synopsis">{episode.synopsis}</p>
      )}

      <div className="player__nav">
        {prev ? (
          <Link to={`/episodio/${season.id}/${prev.id}`}>← {prev.title}</Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/episodio/${season.id}/${next.id}`}>{next.title} →</Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
