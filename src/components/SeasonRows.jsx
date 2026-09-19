import { Link } from "react-router-dom";
import { useSeasons } from "../context/SeasonsContext.jsx";
import EmptyState from "./EmptyState.jsx";

export default function SeasonRows() {
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
    <section id="temporadas" className="rows">
      {seasons.map((season) => (
        <div className="row" key={season.id}>
          <h2 className="row__title">{season.title}</h2>
          <div className="row__scroller">
            {season.episodes.map((episode) => (
              <Link
                key={episode.id}
                to={`/episodio/${season.id}/${episode.id}`}
                className="episode-card"
              >
                <div className="episode-card__thumb">
                  {episode.thumbnail ? (
                    <img src={episode.thumbnail} alt={episode.title} />
                  ) : (
                    <span>{episode.number}</span>
                  )}
                </div>
                <div className="episode-card__body">
                  <p className="episode-card__number">Episodio {episode.number}</p>
                  <h3 className="episode-card__title">{episode.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
