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

      <ul className="episode-list">
        {season.episodes.map((episode) => (
          <li key={episode.id}>
            <Link
              to={`/episodio/${season.id}/${episode.id}`}
              className="episode-row"
            >
              <span className="episode-row__play">▶</span>
              <span className="episode-row__number">EP {episode.number}</span>
              <span className="episode-row__title">{episode.title}</span>
            </Link>
          </li>
        ))}
      </ul>

      {season.episodes.length === 0 && (
        <p className="rows__loading">
          Esta temporada todavía no tiene episodios cargados.
        </p>
      )}
    </div>
  );
}
