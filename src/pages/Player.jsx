import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSeasons } from "../context/SeasonsContext.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
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
  const navigate = useNavigate();
  const { seasons, loading } = useSeasons();
  const season = seasons.find((s) => s.id === seasonId);
  const episode = season?.episodes.find((e) => e.id === episodeId);

  useEffect(() => {
    if (!season || !episode) return;
    const existing = getProgressFor(season.id, episode.id);
    if (existing === 0) saveProgress(season.id, episode.id, 0.02);
  }, [season, episode]);

  if (loading) {
    return <div className="player-full player-full--message">Cargando…</div>;
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
          <span className="vp__episode-tag">Episodio {episode.number}</span>
        </div>
        <iframe
          className="player-full__media"
          src={toEmbedUrl(episode.videoUrl)}
          title={episode.title}
          allowFullScreen
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
        onTimeUpdate={(currentTime, duration) => {
          if (!duration) return;
          saveProgress(season.id, episode.id, currentTime / duration);
        }}
        onEnded={() => saveProgress(season.id, episode.id, 1)}
      />
    </div>
  );
}
