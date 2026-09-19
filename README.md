# Mi Serie — plantilla de streaming de una sola serie

Plantilla lista para usar con **React + Vite**, pensada para publicar un
sitio de streaming dedicado a **una sola serie/telenovela**. No trae
capítulos de ejemplo: empieza vacía para que cargues tus propios datos.

## Estructura clave

```
src/
  config/series.js     -> identidad del sitio (título, sinopsis, poster,
                           heroSlides, enlaces para "Más")
  data/seasons.js       -> AQUÍ agregas tus temporadas y episodios (vacío)
  utils/progress.js     -> guarda el avance de "Continuar viendo" (localStorage)
  components/
    Hero.jsx             -> carrusel de portada tipo Blim (con puntos)
    BottomNav.jsx         -> barra inferior Inicio / Buscar / Más
    ContinueWatching.jsx   -> fila "Continuar viendo" con barra de progreso
    SeasonRows.jsx          -> filas horizontales por temporada
    About.jsx                -> sección de sinopsis
  pages/
    Home.jsx    -> arma Hero + Continuar viendo + Temporadas + Acerca de
    Player.jsx  -> reproductor, guarda progreso mientras se ve
    Search.jsx  -> buscador de episodios/temporadas
    More.jsx    -> ficha de la serie + enlaces (pestaña "Más")
```

El diseño imita la estructura de apps de streaming tipo Blim TV: hero a
pantalla completa con carrusel, fila "Continuar viendo", filas de
episodios por temporada y una barra de navegación inferior — todo con
tarjetas de vidrio esmerilado (`glass-card`, `backdrop-filter: blur`).

## 1. Instalar dependencias (en Termux o cualquier entorno con Node)

```bash
npm install
```

## 2. Editar la identidad de la serie

Abre `src/config/series.js` y rellena título, sinopsis, poster, etc.

## 3. Cargar temporadas y episodios

Abre `src/data/seasons.js` y agrega objetos siguiendo el esquema
comentado en el propio archivo. `videoUrl` acepta un enlace directo a
`.mp4`/`.m3u8` o un enlace de YouTube/Vimeo (se convierte a embed
automáticamente).

## 4. Probar en local

```bash
npm run dev
```

## 5. Publicar en GitHub Pages

1. Sube este proyecto a un repositorio nuevo en GitHub.
2. En `vite.config.js`, cambia `base` para que coincida **exactamente**
   con el nombre de tu repositorio (ej. `/streaming-la-rosa/`).
3. En GitHub, ve a **Settings → Pages** y en "Build and deployment"
   elige **GitHub Actions** como fuente.
4. Haz push a la rama `main`: el workflow en
   `.github/workflows/deploy.yml` construye el sitio y lo publica
   automáticamente.

El sitio usa `HashRouter`, así que las rutas de episodio
(`/#/episodio/t1/t1e1`) funcionan directo en GitHub Pages sin
configuración adicional de servidor.

## Notas

- El diseño es un punto de partida (tema oscuro, tipografía Fraunces +
  Inter, acentos vino/dorado); puedes ajustar los colores en
  `src/styles/index.css` (`:root`).
- Las imágenes (poster, backdrop, miniaturas) van en la carpeta
  `public/` y se referencian con rutas como `/poster.jpg`.
- "Continuar viendo" se guarda en el `localStorage` del navegador de
  cada visitante (no hay cuentas ni backend); si usas videos `.mp4`
  el progreso avanza en tiempo real, y con embeds de YouTube/Vimeo se
  marca el episodio como "empezado" al abrirlo.
- Puedes definir varias diapositivas para el hero en
  `heroSlides` dentro de `series.js`, como el carrusel de Blim.
