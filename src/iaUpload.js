// Sube un archivo a tu item de Internet Archive a través de tu propio
// Cloudflare Worker (que guarda las llaves de forma segura). Devuelve
// la URL final del archivo ya subido.
export async function subirAArchiveOrg(file, identifier) {
  const workerUrl = import.meta.env.VITE_IA_WORKER_URL
  if (!workerUrl) {
    throw new Error(
      'Falta configurar VITE_IA_WORKER_URL en tu archivo .env y en los Secrets de GitHub.'
    )
  }
  if (!identifier) {
    throw new Error('Falta el identificador del item de Internet Archive.')
  }

  const nombreArchivo = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const respuesta = await fetch(workerUrl, {
    method: 'POST',
    headers: {
      'X-File-Name': nombreArchivo,
      'X-Identifier': identifier,
    },
    body: file,
  })

  const datos = await respuesta.json()
  if (!respuesta.ok) {
    throw new Error(datos.error || 'No se pudo subir el archivo.')
  }
  return datos.url
}
