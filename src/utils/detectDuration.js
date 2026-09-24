// Intenta detectar la duración de un video leyendo sus metadatos
// directamente desde la URL. Solo funciona con archivos de video
// directos (.mp4, .m3u8, etc.) — los embeds de YouTube/Vimeo no se
// pueden leer así, en ese caso devuelve null y el episodio se guarda
// sin duración.
export function detectVideoDuration(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = url;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    const timeout = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 9000);

    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      const seconds = video.duration;
      cleanup();
      if (!Number.isFinite(seconds) || seconds <= 0) {
        resolve(null);
        return;
      }
      const minutes = Math.round(seconds / 60);
      resolve(`${Math.max(minutes, 1)} min`);
    };

    video.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(null);
    };
  });
}
