import { Link } from "react-router-dom";
import { useSeasons } from "../context/SeasonsContext.jsx";
import EmptyState from "./EmptyState.jsx";

export default function SeasonSelector() {
  const { seasons, loading } = useSeasons();

  if (loading) {
    return (
      <section id="temporadas" className="rows">
        <p className="rows__loading">Cargando temporadas…</p>
      </section>
    );
  }

  if (seasons.length === 0) {
    return (
      <section id="temporadas" className="rows">
        <EmptyState />
      </section>
    );
  }

  return (
    <section id="temporadas" className="row">
      <h2 className="row__title">Temporadas</h2>
      <div className="row__scroller">
        {seasons.map((season) => (
          <Link
            key={season.id}
            to={`/temporada/${season.id}`}
            className="season-card"
          >
            <span className="season-card__number">
              Temporada {season.number}
            </span>
            <span className="season-card__title">{season.title}</span>
            <span className="season-card__count">
              {season.episodes.length}{" "}
              {season.episodes.length === 1 ? "episodio" : "episodios"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
