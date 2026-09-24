import series from "../config/series.js";

export default function More() {
  return (
    <div className="more-page page-enter">
      <div className="more-page__header glass-card">
        {series.poster ? (
          <img className="more-page__poster" src={series.poster} alt={series.title} />
        ) : (
          <div className="more-page__poster more-page__poster--placeholder">
            {series.shortName}
          </div>
        )}
        <div>
          <h1 className="more-page__title">{series.title}</h1>
          <p className="more-page__meta">
            {[series.tagline, series.year].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <p className="more-page__synopsis">{series.synopsis}</p>

      {series.links?.length > 0 && (
        <div className="more-page__links">
          {series.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="more-page__link glass-card"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <p className="footer-note">
        {series.title} — sitio no oficial, sin fines de lucro.
      </p>
    </div>
  );
}
