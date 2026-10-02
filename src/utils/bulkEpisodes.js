// Interpreta texto pegado con varios episodios, uno por línea, con los
// campos separados por "|":
//
//   numero | título | URL del video (opcional) | miniatura (opcional) | sinopsis (opcional)
//
// La URL del video es opcional: puedes guardar el episodio solo con
// número y título, y agregarle la URL después (editándolo individualmente
// en la lista de episodios) en cuanto tengas el video listo.
//
// Devuelve un arreglo con lo que pudo leer de cada línea, más los
// errores que encuentre (para mostrarlos en la vista previa).
export function parseBulkEpisodes(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [number, title, videoUrl, thumbnail, synopsis] = line
        .split("|")
        .map((part) => (part ?? "").trim());

      const errors = [];
      if (!number || Number.isNaN(Number(number))) {
        errors.push("número inválido");
      }
      if (!title) errors.push("falta el título");

      return {
        line: i + 1,
        raw: line,
        number: Number(number),
        title: title || "",
        videoUrl: videoUrl || "",
        thumbnail: thumbnail || "",
        synopsis: synopsis || "",
        errors,
      };
    });
}
