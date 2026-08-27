// Convierte "40:00" o "1:20:00" a segundos. Si no se puede leer, usa un
// valor por defecto razonable (25 minutos) para que el horario no se rompa.
export function parseDuration(str) {
  if (!str) return 1500
  const partes = String(str)
    .split(':')
    .map((n) => parseInt(n, 10))
    .filter((n) => !Number.isNaN(n))
  if (partes.length === 0) return 1500
  let segundos = 0
  for (const p of partes) segundos = segundos * 60 + p
  return segundos > 0 ? segundos : 1500
}

// Dada una lista de episodios (en orden) y el momento en que arrancó la
// transmisión, calcula cuál episodio "toca" ahora mismo y en qué segundo,
// como si fuera un canal de TV real. La lista se repite en bucle.
export function getLiveState(episodios, startedAt) {
  if (!episodios || episodios.length === 0 || !startedAt) return null

  const duraciones = episodios.map((ep) => parseDuration(ep.duracion))
  const cicloTotal = duraciones.reduce((a, b) => a + b, 0)
  if (cicloTotal <= 0) return null

  const transcurrido = (Date.now() - startedAt) / 1000
  let posicion = transcurrido % cicloTotal
  if (posicion < 0) posicion += cicloTotal

  let index = 0
  for (; index < episodios.length; index++) {
    if (posicion < duraciones[index]) break
    posicion -= duraciones[index]
  }
  if (index >= episodios.length) index = episodios.length - 1

  return {
    episodio: episodios[index],
    index,
    offset: posicion,
  }
}
