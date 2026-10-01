import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext.jsx";
import { useSeasons } from "../context/SeasonsContext.jsx";
import { detectVideoDuration } from "../utils/detectDuration.js";
import { parseBulkEpisodes } from "../utils/bulkEpisodes.js";
import { downloadSeasonsBackup } from "../utils/backup.js";
import { db } from "../firebase.js";

export default function Admin() {
  const { user, checking } = useAuth();

  if (checking) {
    return <div className="admin-page page-enter">Cargando…</div>;
  }

  return <div className="admin-page page-enter">{user ? <AdminPanel /> : <LoginForm />}</div>;
}

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-login glass-card" onSubmit={handleSubmit}>
      <h1 className="admin-login__title">Acceso de administrador</h1>
      <label className="admin-field">
        <span>Correo</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="admin-field">
        <span>Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="admin-error">{error}</p>}
      <button className="admin-button" type="submit" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

function AdminPanel() {
  const { user, logout } = useAuth();
  const {
    seasons,
    loading,
    addSeason,
    updateSeason,
    deleteSeason,
    addEpisode,
    updateEpisode,
    removeEpisode,
  } = useSeasons();

  return (
    <div className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <h1>Panel de administración</h1>
          <p className="admin-panel__user">{user.email}</p>
        </div>
        <button className="admin-button admin-button--ghost" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      <div className="admin-card glass-card">
        <h2>Copia de seguridad</h2>
        <p className="admin-hint">
          Descarga un archivo .json con todas tus temporadas y episodios
          tal como están ahora mismo en Firestore. Guárdalo en tu celular
          de vez en cuando, por si algo se pierde o se borra sin querer.
        </p>
        <button
          className="admin-button"
          type="button"
          disabled={seasons.length === 0}
          onClick={() => downloadSeasonsBackup(seasons)}
        >
          Descargar copia de seguridad
        </button>
      </div>

      <NewSeasonForm onAdd={addSeason} />

      <NotificationForm />

      {loading && <p className="rows__loading">Cargando temporadas…</p>}

      <SeasonList
        seasons={seasons}
        onUpdateSeason={updateSeason}
        onDeleteSeason={deleteSeason}
      />

      <EpisodeManager
        seasons={seasons}
        onAddEpisode={addEpisode}
        onUpdateEpisode={updateEpisode}
        onRemoveEpisode={removeEpisode}
      />
    </div>
  );
}

function NotificationForm() {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "notifications"), {
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
      setMessage("");
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-card glass-card" onSubmit={handleSubmit}>
      <h2>Enviar aviso</h2>
      <p className="admin-hint">
        Aparece como un banner dentro de la app, solo para quienes la
        tengan instalada en su celular (no es una notificación push del
        sistema, y no llega si el sitio está abierto en una pestaña normal
        del navegador).
      </p>
      <label className="admin-field">
        <span>Mensaje</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Ej. ¡Nuevo episodio disponible!"
          required
        />
      </label>
      <button className="admin-button" type="submit" disabled={saving}>
        {saving ? "Enviando…" : sent ? "Enviado ✓" : "Enviar aviso"}
      </button>
    </form>
  );
}

function NewSeasonForm({ onAdd }) {
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [banner, setBanner] = useState("");
  const [poster, setPoster] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!number || !title) return;
    setSaving(true);
    await onAdd({ number: Number(number), title, synopsis, banner, poster });
    setNumber("");
    setTitle("");
    setSynopsis("");
    setBanner("");
    setPoster("");
    setSaving(false);
  }

  return (
    <form className="admin-card glass-card" onSubmit={handleSubmit}>
      <h2>Nueva temporada</h2>
      <div className="admin-row">
        <label className="admin-field admin-field--small">
          <span>Número</span>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
        </label>
        <label className="admin-field">
          <span>Título</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Temporada 1"
            required
          />
        </label>
      </div>
      <label className="admin-field">
        <span>Portada (URL, opcional)</span>
        <input
          type="url"
          value={poster}
          onChange={(e) => setPoster(e.target.value)}
          placeholder="https://..."
        />
        <small className="admin-hint">
          Se usa en la tarjeta de la temporada en Inicio. Vertical, tipo póster de película (ej. 1080x1440).
        </small>
      </label>
      <label className="admin-field">
        <span>Miniatura de la temporada (URL, opcional)</span>
        <input
          type="url"
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          placeholder="https://..."
        />
        <small className="admin-hint">
          Se usa arriba en la página de la temporada (y de fondo borroso en
          móvil).
        </small>
      </label>
      <label className="admin-field">
        <span>Sinopsis de la temporada (opcional)</span>
        <textarea
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          rows={3}
        />
      </label>
      <button className="admin-button" type="submit" disabled={saving}>
        {saving ? "Guardando…" : "Agregar temporada"}
      </button>
    </form>
  );
}

// Lista de temporadas existentes: cada una se puede editar (miniatura,
// título, sinopsis) o eliminar. Agregar episodios se hace en la
// sección "Añadir episodios" de abajo.
function SeasonList({ seasons, onUpdateSeason, onDeleteSeason }) {
  const [editingId, setEditingId] = useState(null);

  if (seasons.length === 0) return null;

  return (
    <div className="admin-card glass-card">
      <h2>Temporadas</h2>
      <ul className="admin-season-list">
        {seasons.map((season) => (
          <li key={season.id} className="admin-season-list__item">
            <div className="admin-season-list__row">
              <span>
                Temporada {season.number} — {season.title}
                <span className="admin-season-list__count">
                  {" "}
                  ({season.episodes.length}{" "}
                  {season.episodes.length === 1 ? "episodio" : "episodios"})
                </span>
              </span>
              <div className="admin-season-list__actions">
                <button
                  className="admin-link-button"
                  onClick={() =>
                    setEditingId((id) => (id === season.id ? null : season.id))
                  }
                >
                  {editingId === season.id ? "Cerrar" : "Editar"}
                </button>
                <button
                  className="admin-link-button admin-link-button--danger"
                  onClick={() => onDeleteSeason(season.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>

            {editingId === season.id && (
              <EditSeasonForm
                season={season}
                onSave={(updates) => {
                  onUpdateSeason(season.id, updates);
                  setEditingId(null);
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditSeasonForm({ season, onSave }) {
  const [title, setTitle] = useState(season.title);
  const [banner, setBanner] = useState(season.banner || "");
  const [poster, setPoster] = useState(season.poster || "");
  const [synopsis, setSynopsis] = useState(season.synopsis || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({ title, banner, poster, synopsis });
    setSaving(false);
  }

  return (
    <form className="admin-inline-form" onSubmit={handleSubmit}>
      <label className="admin-field">
        <span>Título</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label className="admin-field">
        <span>Portada (URL)</span>
        <input
          type="url"
          value={poster}
          onChange={(e) => setPoster(e.target.value)}
          placeholder="https://..."
        />
        <small className="admin-hint">
          Se usa en la tarjeta de la temporada en Inicio. Vertical, tipo póster de película (ej. 1080x1440).
        </small>
      </label>
      <label className="admin-field">
        <span>Miniatura de la temporada (URL)</span>
        <input
          type="url"
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          placeholder="https://..."
        />
        <small className="admin-hint">
          Se usa arriba en la página de la temporada (y de fondo borroso en
          móvil).
        </small>
      </label>
      <label className="admin-field">
        <span>Sinopsis de la temporada</span>
        <textarea
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          rows={3}
        />
      </label>
      <button className="admin-button admin-button--small" type="submit" disabled={saving}>
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

// Sección única para agregar episodios: una barra para elegir la
// temporada activa, y debajo el formulario + lista de esa temporada.
function EpisodeManager({ seasons, onAddEpisode, onUpdateEpisode, onRemoveEpisode }) {
  const [selectedId, setSelectedId] = useState(seasons[0]?.id ?? null);
  const [editingEpisodeId, setEditingEpisodeId] = useState(null);
  const [mode, setMode] = useState("uno"); // "uno" | "lote"

  useEffect(() => {
    if (!selectedId && seasons.length > 0) {
      setSelectedId(seasons[0].id);
    }
    if (selectedId && !seasons.some((s) => s.id === selectedId)) {
      setSelectedId(seasons[0]?.id ?? null);
    }
  }, [seasons, selectedId]);

  if (seasons.length === 0) return null;

  const selected = seasons.find((s) => s.id === selectedId) || seasons[0];

  return (
    <div className="admin-card glass-card">
      <h2>Añadir episodios</h2>

      <div className="admin-season-picker">
        {seasons.map((season) => (
          <button
            key={season.id}
            type="button"
            className={`admin-season-picker__item ${
              season.id === selected.id
                ? "admin-season-picker__item--active"
                : ""
            }`}
            onClick={() => {
              setSelectedId(season.id);
              setEditingEpisodeId(null);
            }}
          >
            Temporada {season.number}
          </button>
        ))}
      </div>

      <div className="admin-mode-toggle">
        <button
          type="button"
          className={`admin-mode-toggle__item ${
            mode === "uno" ? "admin-mode-toggle__item--active" : ""
          }`}
          onClick={() => setMode("uno")}
        >
          Uno por uno
        </button>
        <button
          type="button"
          className={`admin-mode-toggle__item ${
            mode === "lote" ? "admin-mode-toggle__item--active" : ""
          }`}
          onClick={() => setMode("lote")}
        >
          En lote
        </button>
      </div>

      {mode === "uno" ? (
        <NewEpisodeForm
          key={selected.id}
          onAdd={(episode) => onAddEpisode(selected.id, episode)}
        />
      ) : (
        <BulkEpisodeForm
          key={selected.id}
          onAdd={(episode) => onAddEpisode(selected.id, episode)}
        />
      )}

      {selected.episodes.length > 0 && (
        <ul className="admin-episode-list">
          {selected.episodes.map((ep) => (
            <li key={ep.id} className="admin-episode-list__item">
              <div className="admin-episode-list__row">
                <span>
                  Ep. {ep.number} — {ep.title}
                </span>
                <div className="admin-season-list__actions">
                  <button
                    className="admin-link-button"
                    onClick={() =>
                      setEditingEpisodeId((id) => (id === ep.id ? null : ep.id))
                    }
                  >
                    {editingEpisodeId === ep.id ? "Cerrar" : "Editar"}
                  </button>
                  <button
                    className="admin-link-button admin-link-button--danger"
                    onClick={() => onRemoveEpisode(selected.id, ep)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {editingEpisodeId === ep.id && (
                <EditEpisodeForm
                  episode={ep}
                  onSave={async (updates) => {
                    await onUpdateEpisode(selected.id, ep.id, updates);
                    setEditingEpisodeId(null);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NewEpisodeForm({ onAdd }) {
  const [form, setForm] = useState({
    number: "",
    title: "",
    videoUrl: "",
    synopsis: "",
    thumbnail: "",
  });
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.number || !form.title || !form.videoUrl) return;
    setSaving(true);
    setDetecting(true);
    const duration = await detectVideoDuration(form.videoUrl);
    setDetecting(false);
    await onAdd({
      number: Number(form.number),
      title: form.title,
      videoUrl: form.videoUrl,
      duration: duration || "",
      synopsis: form.synopsis,
      thumbnail: form.thumbnail,
    });
    setForm({
      number: "",
      title: "",
      videoUrl: "",
      synopsis: "",
      thumbnail: "",
    });
    setSaving(false);
  }

  return (
    <form className="admin-episode-form" onSubmit={handleSubmit}>
      <div className="admin-row">
        <label className="admin-field admin-field--small">
          <span>Número</span>
          <input
            type="number"
            value={form.number}
            onChange={(e) => update("number", e.target.value)}
            required
          />
        </label>
        <label className="admin-field">
          <span>Título del episodio</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </label>
      </div>

      <label className="admin-field">
        <span>URL del video</span>
        <input
          type="url"
          value={form.videoUrl}
          onChange={(e) => update("videoUrl", e.target.value)}
          placeholder="https://..."
          required
        />
        <small className="admin-hint">
          La duración se detecta sola al leer la URL (solo funciona con
          archivos de video directos, no con embeds de YouTube/Vimeo).
        </small>
      </label>

      <label className="admin-field">
        <span>Miniatura (URL, opcional)</span>
        <input
          type="url"
          value={form.thumbnail}
          onChange={(e) => update("thumbnail", e.target.value)}
          placeholder="https://..."
        />
      </label>

      <label className="admin-field">
        <span>Sinopsis (opcional)</span>
        <textarea
          value={form.synopsis}
          onChange={(e) => update("synopsis", e.target.value)}
          rows={3}
        />
      </label>

      <button className="admin-button" type="submit" disabled={saving}>
        {detecting
          ? "Detectando duración…"
          : saving
          ? "Guardando…"
          : "Guardar episodio"}
      </button>
    </form>
  );
}

function BulkEpisodeForm({ onAdd }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [done, setDone] = useState(false);

  function handlePreview() {
    setDone(false);
    setParsed(parseBulkEpisodes(text));
  }

  function handleEditAgain() {
    setParsed(null);
  }

  async function handleConfirm() {
    const valid = parsed.filter((ep) => ep.errors.length === 0);
    setSaving(true);
    for (let i = 0; i < valid.length; i++) {
      const ep = valid[i];
      setProgress({ current: i + 1, total: valid.length });
      const duration = await detectVideoDuration(ep.videoUrl);
      await onAdd({
        number: ep.number,
        title: ep.title,
        videoUrl: ep.videoUrl,
        duration: duration || "",
        thumbnail: ep.thumbnail,
        synopsis: ep.synopsis,
      });
    }
    setSaving(false);
    setProgress(null);
    setParsed(null);
    setText("");
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  if (parsed) {
    const valid = parsed.filter((ep) => ep.errors.length === 0);
    const invalid = parsed.filter((ep) => ep.errors.length > 0);

    return (
      <div className="admin-bulk-preview">
        <p className="admin-hint">
          Vista previa — se van a guardar <strong>{valid.length}</strong>{" "}
          episodio(s){invalid.length > 0 && <> · {invalid.length} con error, no se guardarán</>}.
        </p>

        <ul className="admin-bulk-preview__list">
          {parsed.map((ep) => (
            <li
              key={ep.line}
              className={`admin-bulk-preview__item ${
                ep.errors.length > 0 ? "admin-bulk-preview__item--error" : ""
              }`}
            >
              <span className="admin-bulk-preview__line">L{ep.line}</span>
              <span>
                {ep.errors.length > 0 ? (
                  <>⚠ {ep.errors.join(", ")} — "{ep.raw}"</>
                ) : (
                  <>
                    Ep. {ep.number} — {ep.title}
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>

        {progress && (
          <p className="admin-hint">
            Guardando {progress.current} de {progress.total}…
          </p>
        )}

        <div className="admin-row">
          <button
            className="admin-button admin-button--ghost"
            type="button"
            onClick={handleEditAgain}
            disabled={saving}
          >
            Editar de nuevo
          </button>
          <button
            className="admin-button"
            type="button"
            onClick={handleConfirm}
            disabled={saving || valid.length === 0}
          >
            {saving ? "Guardando…" : `Confirmar y guardar ${valid.length}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-episode-form">
      <label className="admin-field">
        <span>Pega varios episodios, uno por línea</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={
            "925|La mujer alada|https://.../video.mp4|https://.../miniatura.jpg|Sinopsis opcional\n" +
            "934|Una alerta de esperanza|https://.../video2.mp4"
          }
        />
        <small className="admin-hint">
          Formato por línea: <code>número | título | URL del video |
          miniatura (opcional) | sinopsis (opcional)</code>. La duración se
          detecta sola, igual que al agregar uno solo.
        </small>
      </label>
      <button
        className="admin-button"
        type="button"
        onClick={handlePreview}
        disabled={!text.trim()}
      >
        Vista previa
      </button>
      {done && <p className="admin-hint">✓ Episodios guardados.</p>}
    </div>
  );
}

function EditEpisodeForm({ episode, onSave }) {
  const [form, setForm] = useState({
    number: episode.number,
    title: episode.title,
    videoUrl: episode.videoUrl || "",
    synopsis: episode.synopsis || "",
    thumbnail: episode.thumbnail || "",
  });
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.number || !form.title || !form.videoUrl) return;
    setSaving(true);

    let duration = episode.duration || "";
    if (form.videoUrl !== episode.videoUrl) {
      setDetecting(true);
      duration = (await detectVideoDuration(form.videoUrl)) || "";
      setDetecting(false);
    }

    await onSave({
      number: Number(form.number),
      title: form.title,
      videoUrl: form.videoUrl,
      duration,
      synopsis: form.synopsis,
      thumbnail: form.thumbnail,
    });
    setSaving(false);
  }

  return (
    <form className="admin-inline-form" onSubmit={handleSubmit}>
      <div className="admin-row">
        <label className="admin-field admin-field--small">
          <span>Número</span>
          <input
            type="number"
            value={form.number}
            onChange={(e) => update("number", e.target.value)}
            required
          />
        </label>
        <label className="admin-field">
          <span>Título del episodio</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </label>
      </div>

      <label className="admin-field">
        <span>URL del video</span>
        <input
          type="url"
          value={form.videoUrl}
          onChange={(e) => update("videoUrl", e.target.value)}
          placeholder="https://..."
          required
        />
        <small className="admin-hint">
          {episode.duration
            ? `Duración actual: ${episode.duration}`
            : "Sin duración detectada todavía."}{" "}
          Si cambias la URL, se vuelve a detectar sola.
        </small>
      </label>

      <label className="admin-field">
        <span>Miniatura (URL, opcional)</span>
        <input
          type="url"
          value={form.thumbnail}
          onChange={(e) => update("thumbnail", e.target.value)}
          placeholder="https://..."
        />
      </label>

      <label className="admin-field">
        <span>Sinopsis (opcional)</span>
        <textarea
          value={form.synopsis}
          onChange={(e) => update("synopsis", e.target.value)}
          rows={3}
        />
      </label>

      <button
        className="admin-button admin-button--small"
        type="submit"
        disabled={saving}
      >
        {detecting
          ? "Detectando duración…"
          : saving
          ? "Guardando…"
          : "Guardar cambios"}
      </button>
    </form>
  );
}
