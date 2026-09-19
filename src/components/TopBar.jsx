import series from "../config/series.js";

export default function TopBar() {
  return (
    <header className="top-bar">
      <span className="top-bar__logo">
        {series.shortName || series.title}
      </span>
    </header>
  );
}
