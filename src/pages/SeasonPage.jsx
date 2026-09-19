import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSeasons } from "../context/SeasonsContext.jsx";
import series from "../config/series.js";

export default function SeasonPage() {
  const { seasonId } = useParams();
  const { seasons, loading } = useSeasons();
  const season = seasons.find((s) => s.id === seasonId);

  if (loading) {
    return <div className="season-page">Cargando…</div>;
  }

  if (!season) {
    return (
      <div className="season-page">
        <Link to="/" className="player__back">
          ← Volver
        </Link>
        <p>No se encontró esa temporada.</p>
      </div>
    );
  }

  const pageTitle = `${series.title} Temporada ${season.number}`;
  const banner = season.banner || series.backdrop || series.poster || "";

  return (
    <div className="season-page">
      <Link to="/" className="player__back season-page__back">
        ← Volver
      </Link>

      <div className="season-banner">
        {banner ? (
          <img src={banner} alt={pageTitle} />
        ) : (
          <span>{series.shortName}</span>
        )}
      </div>

      <div className="season-info">
        <h1 className="season-info__title">{pageTitle}</h1>

        {series.rating > 0 && (
          <div
            className="season-info__stars"
            aria-label={`${series.rating} de 5 estrellas`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={i < series.rating ? "star star--filled" : "star"}
              >
                ★
              </span>
            ))}
          </div>
        )}

        <div className="season-info__badges">
          <span className="badge">
            {season.episodes.length}{" "}
            {season.episodes.length === 1 ? "episodio" : "episodios"}
          </span>
          {series.year && <span className="badge">{series.year}</span>}
          {series.contentRating && (
            <span className="badge badge--outline">{series.contentRating}</span>
          )}
        </div>

        <p className="season-info__synopsis">
          {season.synopsis || series.synopsis}
        </p>
      </div>

      <div className="season-pill">▲ TEMPORADA {season.number}</div>

      <EpisodeList seasonId={season.id} episodes={season.episodes} />

      {season.episodes.length === 0 && (
        <p className="rows__loading">
          Esta temporada todavía no tiene episodios cargados.
        </p>
      )}
    </div>
  );
}

function EpisodeList({ seasonId, episodes }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <ul className="episode-list">
      {episodes.map((episode) => {
        const isOpen = expandedId === episode.id;
        return (
          <li key={episode.id}>
            <button
              type="button"
              className="episode-row"
              onClick={() => setExpandedId(isOpen ? null : episode.id)}
              aria-expanded={isOpen}
            >
              <span className="episode-row__number">EP {episode.number}</span>
              <span className="episode-row__title">{episode.title}</span>
            </button>

            {isOpen && (
              <div className="episode-details">
                {episode.duration && (
                  <p className="episode-details__duration">
                    {episode.duration}
                  </p>
                )}
                <p className="episode-details__synopsis">
                  {episode.synopsis || "Sin descripción disponible."}
                </p>
                <Link
                  to={`/episodio/${seasonId}/${episode.id}`}
                  className="episode-details__watch"
                >
                  VER AHORA
                </Link>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
