// Determina si un capítulo ya se puede mostrar públicamente. Si no tiene
// fecha de estreno programada, siempre se muestra. Si tiene una fecha
// futura, se oculta hasta que llegue ese momento.
export function yaEstrenado(item) {
  return !item.estrenoEn || item.estrenoEn <= Date.now()
}

export function formatFechaEstreno(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
