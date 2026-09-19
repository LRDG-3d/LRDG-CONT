import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSeasons } from "../context/SeasonsContext.jsx";

export default function Admin() {
  const { user, checking } = useAuth();

  if (checking) {
    return <div className="admin-page">Cargando…</div>;
  }

  return <div className="admin-page">{user ? <AdminPanel /> : <LoginForm />}</div>;
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
    deleteSeason,
    addEpisode,
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

      <SeasonList seasons={seasons} onDeleteSeason={deleteSeason} />

      <EpisodeManager
        seasons={seasons}
        onAddEpisode={addEpisode}
        onRemoveEpisode={removeEpisode}
      />
    </div>
  );
}

function NewSeasonForm({ onAdd }) {
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!number || !title) return;
    setSaving(true);
    await onAdd({ number: Number(number), title, synopsis });
    setNumber("");
    setTitle("");
    setSynopsis("");
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

// Lista compacta de temporadas existentes, solo para eliminarlas.
// Agregar episodios se hace desde la sección "Añadir episodios" de abajo.
function SeasonList({ seasons, onDeleteSeason }) {
  if (seasons.length === 0) return null;

  return (
    <div className="admin-card glass-card">
      <h2>Temporadas</h2>
      <ul className="admin-season-list">
        {seasons.map((season) => (
          <li key={season.id}>
            <span>
              Temporada {season.number} — {season.title}
              <span className="admin-season-list__count">
                {" "}
                ({season.episodes.length}{" "}
                {season.episodes.length === 1 ? "episodio" : "episodios"})
              </span>
            </span>
            <button
              className="admin-link-button"
              onClick={() => onDeleteSeason(season.id)}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Sección única para agregar episodios: una barra para elegir la
// temporada activa, y debajo el formulario + lista de esa temporada.
function EpisodeManager({ seasons, onAddEpisode, onRemoveEpisode }) {
  const [selectedId, setSelectedId] = useState(seasons[0]?.id ?? null);

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
            onClick={() => setSelectedId(season.id)}
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
            <li key={ep.id}>
              <span>
                Ep. {ep.number} — {ep.title}
              </span>
              <button
                className="admin-link-button"
                onClick={() => onRemoveEpisode(selected.id, ep)}
              >
                Eliminar
              </button>
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
    duration: "",
    synopsis: "",
    thumbnail: "",
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.number || !form.title || !form.videoUrl) return;
    setSaving(true);
    await onAdd({
      number: Number(form.number),
      title: form.title,
      videoUrl: form.videoUrl,
      duration: form.duration,
      synopsis: form.synopsis,
      thumbnail: form.thumbnail,
    });
    setForm({
      number: "",
      title: "",
      videoUrl: "",
      duration: "",
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
      </label>

      <div className="admin-row">
        <label className="admin-field admin-field--small">
          <span>Duración</span>
          <input
            type="text"
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
            placeholder="45 min"
          />
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
      </div>

      <label className="admin-field">
        <span>Sinopsis (opcional)</span>
        <textarea
          value={form.synopsis}
          onChange={(e) => update("synopsis", e.target.value)}
          rows={3}
        />
      </label>

      <button className="admin-button" type="submit" disabled={saving}>
        {saving ? "Guardando…" : "Guardar episodio"}
      </button>
    </form>
  );
}
