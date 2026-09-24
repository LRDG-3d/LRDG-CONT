import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSeasons } from "../context/SeasonsContext.jsx";
import { detectVideoDuration } from "../utils/detectDuration.js";

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

      <NewSeasonForm onAdd={addSeason} />

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

function NewSeasonForm({ onAdd }) {
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [banner, setBanner] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!number || !title) return;
    setSaving(true);
    await onAdd({ number: Number(number), title, synopsis, banner });
    setNumber("");
    setTitle("");
    setSynopsis("");
    setBanner("");
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
        <span>Miniatura de la temporada (URL, opcional)</span>
        <input
          type="url"
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          placeholder="https://..."
        />
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
  const [synopsis, setSynopsis] = useState(season.synopsis || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({ title, banner, synopsis });
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
        <span>Miniatura de la temporada (URL)</span>
        <input
          type="url"
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          placeholder="https://..."
        />
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

      <NewEpisodeForm
        key={selected.id}
        onAdd={(episode) => onAddEpisode(selected.id, episode)}
      />

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
