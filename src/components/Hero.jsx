import series from "../config/series.js";

export default function Hero() {
  const heroStyle = series.backdrop
    ? { backgroundImage: `url(${series.backdrop})` }
    : undefined;

  return (
    <section
      className={`hero ${series.backdrop ? "hero--with-image" : ""}`}
      style={heroStyle}
    >
      {series.backdrop && <div className="hero__scrim" />}
      <div className="hero__content">
        <div>
          <p className="hero__meta">
            {[series.tagline, series.year].filter(Boolean).join(" · ")}
          </p>
          <h1 className="hero__title">{series.title}</h1>
          <p className="hero__synopsis">{series.synopsis}</p>
          <a href="#temporadas" className="hero__cta">
            Ver episodios
          </a>
        </div>

        {series.poster ? (
          <img className="hero__poster" src={series.poster} alt={series.title} />
        ) : (
          <div className="hero__poster hero__poster--placeholder">
            Agrega un poster en series.js
          </div>
        )}
      </div>
    </section>
  );
}
