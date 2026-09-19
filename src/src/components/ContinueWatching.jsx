import { Link } from "react-router-dom";
import { useSeasons } from "../context/SeasonsContext.jsx";
import { getProgressList } from "../utils/progress.js";

export default function ContinueWatching() {
  const { seasons } = useSeasons();
  const progress = getProgressList();
  if (progress.length === 0) return null;

  const items = progress
    .map((entry) => {
      const season = seasons.find((s) => s.id === entry.seasonId);
      const episode = season?.episodes.find((e) => e.id === entry.episodeId);
      if (!season || !episode) return null;
      return { ...entry, season, episode };
    })
    .filter(Boolean)
    .slice(0, 10);

  if (items.length === 0) return null;

  return (
    <section className="row">
      <h2 className="row__title">Continuar viendo</h2>
      <div className="row__scroller">
        {items.map(({ season, episode, percent }) => (
          <Link
            key={episode.id}
            to={`/episodio/${season.id}/${episode.id}`}
            className="continue-card"
          >
            <div className="continue-card__thumb">
              {episode.thumbnail ? (
                <img src={episode.thumbnail} alt={episode.title} />
              ) : (
                <span>{episode.number}</span>
              )}
              <div className="continue-card__progress">
                <div
                  className="continue-card__progress-fill"
                  style={{ width: `${Math.round(percent * 100)}%` }}
                />
              </div>
            </div>
            <p className="continue-card__label">
              Episodio {episode.number} · {season.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
