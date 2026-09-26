import { Routes, Route, useLocation } from "react-router-dom";
import TopBar from "./components/TopBar.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Home from "./pages/Home.jsx";
import Player from "./pages/Player.jsx";
import Search from "./pages/Search.jsx";
import More from "./pages/More.jsx";
import Admin from "./pages/Admin.jsx";
import SeasonPage from "./pages/SeasonPage.jsx";
import "./styles/App.css";

export default function App() {
  const { pathname } = useLocation();
  const isPlayerRoute = pathname.startsWith("/episodio/");
  const hideBottomNav = pathname.startsWith("/temporada/");

  if (isPlayerRoute) {
    // El reproductor ocupa toda la pantalla, sin barra superior ni inferior.
    return (
      <Routes>
        <Route path="/episodio/:seasonId/:episodeId" element={<Player />} />
      </Routes>
    );
  }

  return (
    <div className="site">
      <TopBar />
      <div
        className={`site__scroll ${hideBottomNav ? "site__scroll--no-nav" : ""}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/temporada/:seasonId" element={<SeasonPage />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/mas" element={<More />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
