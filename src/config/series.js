// -----------------------------------------------------------------------
// CONFIGURACIÓN DE LA SERIE
// Este archivo es el único lugar que necesitas editar para adaptar el
// sitio a tu propia serie. Todo el diseño lee estos valores.
// -----------------------------------------------------------------------
const series = {
  // Nombre de la serie, se usa en el header, el hero y el <title>
  title: "Nombre de tu serie",

  // Frase corta bajo el título (género, país de origen, etc.)
  tagline: "Telenovela · Drama",

  // Descripción larga para la sección "Acerca de"
  synopsis:
    "Escribe aquí la sinopsis de la serie. Este texto aparece en el " +
    "hero, debajo del título, y presenta la trama a quien entra por " +
    "primera vez al sitio.",

  // Imagen de portada (poster vertical). Pon el archivo en /public
  // y referencia la ruta, ej: "/poster.jpg"
  poster: "",

  // Año(s) de emisión, para mostrar junto al tagline
  year: "",

  // Nombre corto para el logo de texto en el header
  shortName: "LRDG TV",

  // Diapositivas del hero (como el carrusel de portada de Blim).
  // Cada slide: { image, title, subtitle }. Dejar vacío usa un solo
  // slide generado con backdrop/title/tagline de arriba.
  // Ejemplo:
  // heroSlides: [
  //   { image: "/hero1.jpg", title: "Temporada 3 ya disponible" },
  //   { image: "/hero2.jpg", title: "Los mejores momentos" },
  // ],
  heroSlides: [],

  // Imagen de fondo del slide por defecto si heroSlides está vacío
  backdrop: "",

  // Redes / enlaces para la pestaña "Más" (opcional)
  links: [
    // { label: "Sitio oficial", url: "https://..." },
  ],
};

export default series;
