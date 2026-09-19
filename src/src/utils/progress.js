const KEY = "continue-watching";

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // almacenamiento no disponible, se ignora silenciosamente
  }
}

// Guarda/actualiza el progreso de un episodio (0 a 1).
export function saveProgress(seasonId, episodeId, percent) {
  const data = readAll();
  data[`${seasonId}:${episodeId}`] = {
    seasonId,
    episodeId,
    percent: Math.max(0, Math.min(1, percent)),
    updatedAt: Date.now(),
  };
  writeAll(data);
}

// Devuelve el progreso guardado, más reciente primero.
export function getProgressList() {
  const data = readAll();
  return Object.values(data).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProgressFor(seasonId, episodeId) {
  const data = readAll();
  return data[`${seasonId}:${episodeId}`]?.percent ?? 0;
}
