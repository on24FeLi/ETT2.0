const urlaube = JSON.parse(localStorage.getItem("urlaube")) || [];
if (urlaube.length === 0) {
  addUrlaub(1, "2025-05-10", "2025-05-14");
  addUrlaub(2, "2025-06-01", "2025-06-03");
}
function saveUrlaube(urlaube) {
  localStorage.setItem("urlaube", JSON.stringify(urlaube));
}
function calculateTage(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffInMs = endDate - startDate;
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
}
function addUrlaub(userId, start, end) {
  const stored = JSON.parse(localStorage.getItem("urlaube")) || [];
  const exists = stored.some(
    (u) => u.userId === userId && u.start === start && u.end === end
  );

  if (exists) {
    console.warn("Urlaub für diesen Zeitraum existiert bereits.");
    return; // Kein Eintrag hinzufügen
  }
  const id = stored.length > 0 ? Math.max(...stored.map(u => u.id)) + 1 : 1;
  const tage = calculateTage(start, end);

  stored.push({
    id,
    userId,
    start,
    end,
    tage
  });

  saveUrlaube(stored);
}

function deleteUrlaub(id) {
  const filtered = urlaube.filter(u => u.id !== id);
  saveUrlaube(filtered);
}

function getUrlaubeByUser(userId) {
  const stored = JSON.parse(localStorage.getItem("urlaube")) || [];
  return stored.filter(u => u.userId === userId);
}


export { addUrlaub, deleteUrlaub, getUrlaubeByUser };