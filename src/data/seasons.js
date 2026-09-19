// -----------------------------------------------------------------------
// TEMPORADAS Y EPISODIOS
// Este archivo empieza vacío a propósito: no trae capítulos de ejemplo.
// Agrega tus propias temporadas siguiendo el esquema de abajo.
//
// Cada temporada:
// {
//   id: "t1",                 -> identificador único, sin espacios
//   number: 1,                -> número de temporada
//   title: "Temporada 1",     -> etiqueta visible
//   episodes: [
//     {
//       id: "t1e1",           -> identificador único del episodio
//       number: 1,            -> número dentro de la temporada
//       title: "Título del episodio",
//       synopsis: "Resumen corto del episodio.",
//       duration: "45 min",
//       thumbnail: "/thumbs/t1e1.jpg",   -> ruta en /public, opcional
//       videoUrl: "https://.../video.mp4", // o un embed .m3u8, YouTube, etc.
//     },
//   ],
// }
//
// Ejemplo de cómo se vería UNA temporada (déjalo comentado como guía,
// o bórralo cuando agregues tus propios datos reales):
//
// {
//   id: "t1",
//   number: 1,
//   title: "Temporada 1",
//   episodes: [
//     {
//       id: "t1e1",
//       number: 1,
//       title: "El comienzo",
//       synopsis: "Aquí va el resumen del episodio.",
//       duration: "45 min",
//       thumbnail: "/thumbs/t1e1.jpg",
//       videoUrl: "https://example.com/videos/t1e1.mp4",
//     },
//   ],
// },
// -----------------------------------------------------------------------

const seasons = [];

export default seasons;
