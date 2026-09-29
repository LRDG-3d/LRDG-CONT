import { NavLink } from "react-router-dom";
import series from "../config/series.js";

export default function TopBar() {
  return (
    <header className="top-bar">
      <span className="top-bar__logo">
        {series.shortName || series.title}
      </span>

      {/* Solo se muestra en pantallas grandes (ver App.css) */}
      <nav className="top-bar__nav">
        {[
          { to: "/", label: "Inicio", end: true },
          { to: "/buscar", label: "Buscar" },
          { to: "/mas", label: "Más" },
        ].map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `top-bar__link ${isActive ? "top-bar__link--active" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
