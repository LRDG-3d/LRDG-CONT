// Toma un archivo de imagen (ej. una captura de pantalla del celular),
// lo redimensiona para que no pese demasiado, y lo devuelve como data URL
// listo para usar como miniatura. No depende de CORS porque el archivo
// viene directo del dispositivo, no de un servidor externo.
export function archivoAMiniatura(file, maxAncho = 640) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const escala = Math.min(1, maxAncho / img.width)
        const w = Math.round(img.width * escala)
        const h = Math.round(img.height * escala)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => reject(new Error('No se pudo procesar esa imagen.'))
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
