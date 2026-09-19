import { useState } from "react";
import seasons from "../data/seasons.js";
import EpisodeCard from "./EpisodeCard.jsx";
import EmptyState from "./EmptyState.jsx";

export default function SeasonBrowser() {
  const [activeId, setActiveId] = useState(seasons[0]?.id);
  const active = seasons.find((s) => s.id === activeId) || seasons[0];

  return (
    <section id="temporadas" className="seasons">
      {seasons.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="seasons__tabs">
            {seasons.map((season) => (
              <button
                key={season.id}
                className={`seasons__tab ${
                  season.id === active?.id ? "seasons__tab--active" : ""
                }`}
                onClick={() => setActiveId(season.id)}
              >
                {season.title}
              </button>
            ))}
          </div>

          <div className="episode-grid">
            {active?.episodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                seasonId={active.id}
                episode={episode}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
