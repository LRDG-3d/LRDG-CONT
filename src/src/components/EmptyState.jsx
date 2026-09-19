export default function EmptyState() {
  return (
    <div className="empty-state glass-card">
      <h2 className="empty-state__title">Todavía no hay temporadas cargadas</h2>
      <p className="empty-state__body">
        Este sitio arranca sin capítulos de ejemplo. Inicia sesión como
        administrador y agrega tus temporadas y episodios reales en:
      </p>
      <span className="empty-state__code">/#/admin</span>
    </div>
  );
}
