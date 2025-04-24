const workTimes = JSON.parse(localStorage.getItem("workTimes")) || [];

function addWorkTime(userId, date, workinghours, start, end) {
    const alreadyExists = workTimes.some(w =>
        w.userId === userId && w.date === date && w.start === start && w.end === end
      );
    
      if (!alreadyExists) {
        workTimes.push({ userId, date, workinghours, start, end });
        localStorage.setItem("workTimes", JSON.stringify(workTimes));
      }
}

function getWorkTimesByUser(userId) {
  return workTimes.filter(entry => entry.userId === userId);
}

function deleteWorkTimesByUser(userId) {
  const filtered = workTimes.filter(entry => entry.userId !== userId);
  localStorage.setItem("workTimes", JSON.stringify(filtered));
}

addWorkTime(2, "2025-04-17", "12","08:00", "20:00");
addWorkTime(2, "2025-04-21", "7","09:00", "16:00");
addWorkTime(2, "2025-04-22","8" ,"08:00", "16:30");
addWorkTime(2, "2025-04-23", "6","08:15", "17:00");
addWorkTime(1, "2025-04-23", "10","08:15", "17:00");
addWorkTime(1, "2025-04-18", "12","08:15", "17:00");
export { workTimes, addWorkTime, getWorkTimesByUser, deleteWorkTimesByUser };