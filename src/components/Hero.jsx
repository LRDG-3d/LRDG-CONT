import { useEffect, useMemo, useState } from "react";
import series from "../config/series.js";

export default function Hero() {
  const slides = useMemo(() => {
    if (series.heroSlides?.length) return series.heroSlides;
    return [
      {
        image: series.backdrop || series.poster || "",
        title: series.title,
        subtitle: series.tagline,
      },
    ];
  }, []);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <section
      className="hero"
      style={slide.image ? { backgroundImage: `url(${slide.image})` } : undefined}
    >
      <div className="hero__scrim" />

      <div className="hero__content">
        <h1 className="hero__title">{slide.title || series.title}</h1>
        {slide.subtitle && <p className="hero__subtitle">{slide.subtitle}</p>}

        <div className="hero__actions">
          <a href="#temporadas" className="hero__cta hero__cta--primary">
            ▶ Ver ahora
          </a>
          <a href="#sinopsis" className="hero__cta hero__cta--ghost">
            Info
          </a>
        </div>

        {slides.length > 1 && (
          <div className="hero__dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`hero__dot ${i === index ? "hero__dot--active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Ir a la diapositiva ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
