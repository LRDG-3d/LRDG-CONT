import { Link } from "react-router-dom";
import series from "../config/series.js";

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="site-header__mark">
        {series.shortName || series.title} <span>·</span>
      </Link>
    </header>
  );
}
