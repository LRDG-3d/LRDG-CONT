import { Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Home from "./pages/Home.jsx";
import Player from "./pages/Player.jsx";
import Search from "./pages/Search.jsx";
import More from "./pages/More.jsx";
import "./styles/App.css";

export default function App() {
  return (
    <div className="site">
      <TopBar />
      <div className="site__scroll">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/episodio/:seasonId/:episodeId" element={<Player />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/mas" element={<More />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
