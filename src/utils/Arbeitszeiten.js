const workTimes = JSON.parse(localStorage.getItem("workTimes")) || [];

function calcWorkingHours(start, end) {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;
  const diffMinutes = endTotalMinutes - startTotalMinutes;

  // Verhindere negative Werte
  if (diffMinutes <= 0) return 0;

  const hours = diffMinutes / 60;
  return Number(hours.toFixed(2)); // ← hier runden!
}
function addOrUpdateWorkTime(userId, date, workinghours, start, end) {
  const workTimes = JSON.parse(localStorage.getItem("workTimes")) || [];

  // Entferne vorherigen Eintrag mit gleichem userId + date
  const updated = workTimes.filter(
    (entry) => !(entry.userId === userId && entry.date === date)
  );

  let hours = workinghours;
  if (!workinghours && start && end) {
    hours = calcWorkingHours(start, end);
  } else {
    hours = Number(parseFloat(workinghours).toFixed(2));
  }

  if (!isNaN(hours)) {
    updated.push({
      userId,
      date,
      workinghours: hours,
      start,
      end
    });
  }

  localStorage.setItem("workTimes", JSON.stringify(updated));
}
function getWorkTimesByUser(userId) {
  const allTimes = JSON.parse(localStorage.getItem("workTimes")) || [];
  const urlaubDates = expandUrlaubeToDates(userId);
  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const currentUser = allUsers.find(u => u.id === userId);
  const isTeilzeit = currentUser?.arbeitszeitTyp === "Teilzeit";
  const urlaubsstunden = isTeilzeit ? 6 : 8;
  const entriesForUser = allTimes.filter(t => t.userId === userId);

  // Urlaubstage ergänzen, wenn kein Eintrag vorhanden ist
  urlaubDates.forEach(date => {
    const exists = entriesForUser.some(e => e.date === date);
    if (!exists) {
      entriesForUser.push({
        userId,
        date,
        start: "Urlaub",
        end: "Urlaub",
        workinghours: Number(urlaubsstunden.toFixed(2))
      });
    }
  });

  return entriesForUser;
}
function expandUrlaubeToDates(userId) {
  const urlaube = JSON.parse(localStorage.getItem("urlaube")) || [];
  const dates = [];

  urlaube
    .filter(u => u.userId === userId)
    .forEach(({ start, end }) => {
      const current = new Date(start);
      const endDate = new Date(end);
      while (current <= endDate) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) { // 0 = Sonntag, 6 = Samstag
          dates.push(current.toISOString().split("T")[0]);
        }
        current.setDate(current.getDate() + 1);
      }
    });

  return dates;
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