// Carga un video desde una URL, salta a un momento aleatorio (entre el
// inicio y la mitad del video) y "toma una foto" de ese fotograma usando
// un <canvas>, devolviéndola como imagen (data URL) lista para usar como
// miniatura.
export function capturarMiniatura(videoUrl) {
  return new Promise((resolve, reject) => {
    if (!videoUrl) {
      reject(new Error('No hay URL de video.'))
      return
    }

    const video = document.createElement('video')
    video.crossOrigin = 'anonymous' // necesario para poder leer el fotograma
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = videoUrl

    const limpiar = () => {
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }

    const onMeta = () => {
      if (!video.duration || !Number.isFinite(video.duration)) {
        limpiar()
        reject(new Error('No se pudo leer la duración del video.'))
        return
      }
      // Punto aleatorio entre el 5% y el 50% del video (evita el negro
      // inicial y evita caer en créditos finales si el video es corto).
      const punto = video.duration * (0.05 + Math.random() * 0.45)
      video.currentTime = punto
    }

    const onSeeked = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        limpiar()
        resolve(dataUrl)
      } catch (err) {
        limpiar()
        reject(
          new Error(
            'No se pudo capturar el fotograma (posible restricción CORS del servidor de video).'
          )
        )
      }
    }

    const onError = () => {
      limpiar()
      reject(new Error('No se pudo cargar el video desde esa URL.'))
    }

    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
  })
}
