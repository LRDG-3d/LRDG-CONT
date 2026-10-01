// Descarga las temporadas/episodios actuales como un archivo .json,
// para tener una copia de seguridad fuera de Firestore.
export function downloadSeasonsBackup(seasons) {
  const data = JSON.stringify(seasons, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  const fecha = new Date().toISOString().slice(0, 10);
  a.download = `respaldo-episodios-${fecha}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
