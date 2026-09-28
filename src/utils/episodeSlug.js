// Convierte "Nunca Me Abandones" en "Nunca-Me-Abandones"
function slugifyTitle(title) {
  return (title || "")
    .trim()
    .replace(/\s+/g, "-");
}

// Genera algo como "C159-Nunca-Me-Abandones" a partir de un episodio.
// Usa episode.number, que en tu caso ya es el número absoluto del
// capítulo (no reinicia por temporada), así que sirve para
// encontrarlo sin necesitar también el ID de la temporada.
export function buildEpisodeSlug(episode) {
  return `C${episode.number}-${slugifyTitle(episode.title)}`;
}

// A partir del slug de la URL, saca solo el número de capítulo.
export function parseEpisodeNumberFromSlug(slug) {
  const match = String(slug || "").match(/^C(\d+)/i);
  return match ? Number(match[1]) : null;
}
