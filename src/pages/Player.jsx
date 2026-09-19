import { Link, useParams } from "react-router-dom";
import seasons from "../data/seasons.js";

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
  const season = seasons.find((s) => s.id === seasonId);
  const episode = season?.episodes.find((e) => e.id === episodeId);

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

  return (
    <div className="player">
      <Link to="/#temporadas" className="player__back">
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
            <video src={episode.videoUrl} controls preload="metadata" />
          )
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--ink-dim)",
            }}
          >
            Agrega un videoUrl en seasons.js para este episodio
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
