import Hero from "../components/Hero.jsx";
import ContinueWatching from "../components/ContinueWatching.jsx";
import SeasonRows from "../components/SeasonRows.jsx";
import About from "../components/About.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <ContinueWatching />
      <SeasonRows />
      <About />
    </>
  );
}
