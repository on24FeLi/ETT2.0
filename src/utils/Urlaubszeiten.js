function saveUrlaube(urlaube) {
  localStorage.setItem("urlaube", JSON.stringify(urlaube));
}

function calculateTage(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffInMs = endDate - startDate;
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
}

function addUrlaub(userId, start, end, kommentar) {
  const stored = JSON.parse(localStorage.getItem("urlaube")) || [];
  const exists = stored.some(
    (u) => u.userId === userId && u.start === start && u.end === end
  );

  if (exists) {
    console.warn("Urlaub für diesen Zeitraum existiert bereits.");
    return;
  }

  const id = stored.length > 0 ? Math.max(...stored.map(u => u.id)) + 1 : 1;
  const tage = calculateTage(start, end);

  stored.push({
    id,
    userId,
    start,
    end,


    tage, 
   kommentar: kommentar ?? ""

  });

  saveUrlaube(stored);
}

function deleteUrlaub(id) {
  const stored = JSON.parse(localStorage.getItem("urlaube")) || [];
  const filtered = stored.filter(u => u.id !== id);
  saveUrlaube(filtered);
}

function updateUrlaub(id, start, end, kommentar) {
  const stored = JSON.parse(localStorage.getItem("urlaube")) || [];
  const index = stored.findIndex(u => u.id === id);

  if (index !== -1) {
    const tage = calculateTage(start, end);
    stored[index] = { ...stored[index], start, end,tage, kommentar};
    saveUrlaube(stored);
  } else {
    console.warn("Urlaub nicht gefunden.");
  }
}

function getUrlaubeByUser(userId) {
  const stored = JSON.parse(localStorage.getItem("urlaube")) || [];
  return stored.filter(u => u.userId === userId);
}
// ARBEITSZEITEN ERFASSUNG

export { addUrlaub, deleteUrlaub, updateUrlaub, getUrlaubeByUser };