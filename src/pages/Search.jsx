import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSeasons } from "../context/SeasonsContext.jsx";

export default function Search() {
  const { seasons } = useSeasons();
  const [query, setQuery] = useState("");

  const allEpisodes = useMemo(
    () =>
      seasons.flatMap((season) =>
        season.episodes.map((episode) => ({ season, episode }))
      ),
    [seasons]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allEpisodes.filter(
      ({ episode, season }) =>
        episode.title.toLowerCase().includes(q) ||
        season.title.toLowerCase().includes(q)
    );
  }, [query, allEpisodes]);

  return (
    <div className="search-page page-enter">
      <h1 className="search-page__title">Buscar</h1>
      <input
        className="search-page__input glass-card"
        type="search"
        placeholder="Busca un episodio o temporada..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {query && results.length === 0 && (
        <p className="search-page__empty">Sin resultados para "{query}".</p>
      )}

      <div className="search-page__results">
        {results.map(({ season, episode }) => (
          <Link
            key={episode.id}
            to={`/episodio/${season.id}/${episode.id}`}
            className="episode-card episode-card--list"
          >
            <div className="episode-card__thumb">
              {episode.thumbnail ? (
                <img src={episode.thumbnail} alt={episode.title} />
              ) : (
                <span>{episode.number}</span>
              )}
            </div>
            <div className="episode-card__body">
              <p className="episode-card__number">
                {season.title} · Episodio {episode.number}
              </p>
              <h3 className="episode-card__title">{episode.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
