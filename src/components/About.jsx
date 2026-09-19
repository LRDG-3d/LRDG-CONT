import series from "../config/series.js";

export default function About() {
  return (
    <section id="sinopsis" className="about glass-card">
      <h2 className="about__title">Acerca de {series.title}</h2>
      <p className="about__text">{series.synopsis}</p>
    </section>
  );
}
