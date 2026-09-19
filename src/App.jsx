import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Player from "./pages/Player.jsx";
import series from "./config/series.js";
import "./styles/App.css";

export default function App() {
  return (
    <div className="site">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/episodio/:seasonId/:episodeId" element={<Player />} />
      </Routes>
      <footer className="footer">
        {series.title} — sitio no oficial, sin fines de lucro.
      </footer>
    </div>
  );
}
