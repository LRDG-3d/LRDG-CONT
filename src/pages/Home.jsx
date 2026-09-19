import Hero from "../components/Hero.jsx";
import ContinueWatching from "../components/ContinueWatching.jsx";
import SeasonSelector from "../components/SeasonSelector.jsx";
import About from "../components/About.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <ContinueWatching />
      <SeasonSelector />
      <About />
    </>
  );
}
