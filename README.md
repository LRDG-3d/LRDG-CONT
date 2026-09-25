# Mi Serie — plantilla de streaming de una sola serie

Plantilla con **React + Vite**, pensada para un sitio de streaming
dedicado a **una sola serie/telenovela**, con panel de administración
protegido y datos guardados en **Firebase (Auth + Firestore)**.

## Estructura clave

```
src/
  firebase.js            -> configuración de tu proyecto de Firebase
  config/series.js        -> identidad del sitio (título, sinopsis, poster,
                              heroSlides, enlaces para "Más")
  context/
    AuthContext.jsx        -> sesión del administrador (Firebase Auth)
    SeasonsContext.jsx      -> temporadas/episodios en tiempo real (Firestore)
  utils/progress.js       -> guarda el avance de "Continuar viendo" (localStorage)
  components/
    Hero.jsx                -> carrusel de portada
    TopBar.jsx               -> barra superior fija con el logo
    BottomNav.jsx             -> barra inferior Inicio / Buscar / Más
    ContinueWatching.jsx       -> fila "Continuar viendo" con progreso
    SeasonRows.jsx               -> filas horizontales por temporada
  pages/
    Home.jsx    -> arma Hero + Continuar viendo + Temporadas + Acerca de
    Player.jsx  -> reproductor, guarda progreso mientras se ve
    Search.jsx  -> buscador de episodios/temporadas
    More.jsx    -> ficha de la serie + enlaces
    Admin.jsx   -> login + panel para agregar temporadas/episodios
```

Las temporadas y episodios **ya no viven en un archivo del proyecto**:
se guardan en Firestore y se agregan desde `/#/admin`.

## 1. Crear el proyecto de Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
   y crea un proyecto nuevo (gratis, plan Spark).
2. En **Build → Authentication → Sign-in method**, habilita
   **Correo electrónico/contraseña**.
3. En **Authentication → Users**, agrega manualmente al (o los)
   administrador(es): correo + contraseña. Esas son las credenciales
   con las que entrarás a `/#/admin`. No hay registro público, solo tú
   puedes crear cuentas desde la consola.
4. En **Build → Firestore Database**, crea la base de datos (modo
   producción).
5. En la pestaña **Reglas** de Firestore, pega esto y publica:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /seasons/{seasonId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

   Esto permite que cualquiera **lea** las temporadas (para que el
   sitio funcione), pero solo un usuario **autenticado** (o sea, un
   admin que creaste tú) pueda **escribir**.

6. En **⚙️ Configuración del proyecto → Tus apps**, crea una app web
   (ícono `</>`) y copia el objeto `firebaseConfig` que te muestra.

## 2. Pegar tu configuración en el proyecto

Abre `src/firebase.js` y reemplaza los valores de `firebaseConfig`
con los que copiaste de Firebase.

## 3. Instalar dependencias (en Termux o cualquier entorno con Node)

```bash
npm install
```

## 4. Editar la identidad de la serie

Abre `src/config/series.js` y rellena título, sinopsis, poster, etc.
(esto sigue siendo estático, no va en Firestore).

## 5. Probar en local

```bash
npm run dev
```

Entra a `http://localhost:5173/#/admin`, inicia sesión con el correo y
contraseña que creaste en el paso 1.3, y agrega tus temporadas y
episodios (nombre, número, URL del video, duración, miniatura y
sinopsis).

## 6. Publicar en GitHub Pages

1. Sube este proyecto a tu repositorio en GitHub.
2. En `vite.config.js`, confirma que `base` coincide con el nombre de
   tu repositorio.
3. En GitHub, ve a **Settings → Pages** y en "Build and deployment"
   elige **GitHub Actions** como fuente.
4. Haz push a la rama `main`: el workflow en
   `.github/workflows/deploy.yml` construye y publica el sitio.

El panel de administración queda accesible en
`https://tu-usuario.github.io/tu-repo/#/admin` — no aparece en ningún
menú visible, así que solo quien conozca la URL (y tenga cuenta) puede
entrar.

## Instalar como app (PWA)

El sitio ya está configurado como PWA (Progressive Web App): al publicarlo,
el navegador le ofrece a quien lo visita la opción de "Instalar app" /
"Agregar a pantalla de inicio", y se abre sin la barra de direcciones,
como una app normal.

1. `npm install` (instala también `vite-plugin-pwa`, ya está en
   `package.json`).
2. `npm run build` — el plugin genera el manifest y el service worker
   automáticamente dentro de `dist/`.
3. Publica como siempre (push a `main`, el workflow de GitHub Actions
   hace el resto).
4. En el celular, entra al sitio con Chrome → menú (⋮) → **"Instalar
   app"**.

Los íconos están en `public/icon-192.png` y `public/icon-512.png` —
reemplázalos por los tuyos (mismo nombre y tamaño) si quieres un ícono
distinto. El nombre y colores de la app se configuran en el bloque
`manifest` dentro de `vite.config.js`.

Si alguna vez el sitio se queda "atascado" mostrando una versión vieja
después de actualizar (típico de los Service Workers), hay que borrar
los datos/caché del sitio en el navegador para forzar la versión
nueva — con `registerType: "autoUpdate"` esto normalmente pasa solo.

## Notas

- El diseño usa tema oscuro, tipografía Fraunces + Inter, acentos
  vino/dorado y tarjetas de vidrio esmerilado; ajustable en
  `src/styles/index.css` (`:root`) y `src/styles/App.css`.
- "Continuar viendo" se guarda en el `localStorage` de cada
  visitante (no depende de Firebase); con video `.mp4` el progreso
  avanza en tiempo real, con embeds de YouTube/Vimeo se marca como
  "empezado" al abrirlo.
- Puedes definir varias diapositivas para el hero en `heroSlides`
  dentro de `series.js`.
- Las claves de `firebase.js` no son secretas (se usan en el
  cliente); lo que realmente protege tus datos son las reglas de
  Firestore del paso 1.5.
