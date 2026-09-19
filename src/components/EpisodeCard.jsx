import { Link } from "react-router-dom";

export default function EpisodeCard({ seasonId, episode }) {
  return (
    <Link
      to={`/episodio/${seasonId}/${episode.id}`}
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
        {episode.synopsis && (
          <p className="episode-card__synopsis">{episode.synopsis}</p>
        )}
      </div>
    </Link>
  );
}
