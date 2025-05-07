const workTimes = JSON.parse(localStorage.getItem("workTimes")) || [];

function addOrUpdateWorkTime(userId, date, workinghours, start, end) {
  const workTimes = JSON.parse(localStorage.getItem("workTimes")) || [];

  // Entferne vorherigen Eintrag mit gleichem userId + date
  const updated = workTimes.filter(
    (entry) => !(entry.userId === userId && entry.date === date)
  );

  // Füge neuen Eintrag hinzu
  updated.push({ userId, date, workinghours, start, end });

  localStorage.setItem("workTimes", JSON.stringify(updated));
}
function getWorkTimesByUser(userId) {
  const all = JSON.parse(localStorage.getItem('workTimes')) || [];
  return all.filter(entry => entry.userId === userId);
}

function deleteWorkTimesByUser(userId) {
  const filtered = workTimes.filter(entry => entry.userId !== userId);
  localStorage.setItem("workTimes", JSON.stringify(filtered));
}

addOrUpdateWorkTime(2, "2025-04-17", "12","08:00", "20:00");
addOrUpdateWorkTime(2, "2025-04-21", "7","09:00", "16:00");
addOrUpdateWorkTime(2, "2025-04-22","8" ,"08:00", "16:30");
addOrUpdateWorkTime(2, "2025-04-23", "6","08:15", "17:00");
addOrUpdateWorkTime(1, "2025-04-23", "10","08:15", "17:00");
addOrUpdateWorkTime(1, "2025-04-18", "12","08:15", "17:00");
addOrUpdateWorkTime(2, "2025-05-04", "40","08:15", "17:00");
export { addOrUpdateWorkTime, getWorkTimesByUser, deleteWorkTimesByUser };