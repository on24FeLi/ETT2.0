<script setup>
import { ref, onMounted, computed } from "vue";
import Uhrzeit from "@/components/Uhrzeit.vue";
import navigation from "@/components/navigation.vue";
let startTimestamp = null;
let stopTimestamp = null;
//--> Buttons <--
const isRunning = ref(false);
const totalSeconds = ref(0);
const storedStartTime = ref("-");
const storedEndTime = ref("-");
const todaysStoredHours = ref("0h 0min");
let intervalId = null; // <-- Wichtig!

//--> Zeit als HH:MM:SS anzeigen
const formattedTime = computed(() => {
  const hours = String(Math.floor(totalSeconds.value / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds.value % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds.value % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
});

function toggleTimer() {
  isRunning.value = !isRunning.value;

  if (isRunning.value) {
    const todayDate = new Date().toISOString().split("T")[0];
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const existingEntries = JSON.parse(localStorage.getItem("workTimes")) || [];
    const todayEntry = existingEntries.find(
      (entry) => entry.userId === user.id && entry.date === todayDate
    );

    startTimestamp = new Date();
    intervalId = setInterval(() => {
      totalSeconds.value++;
    }, 1000);
  } else {
    // Timer stoppen
    clearInterval(intervalId);
    intervalId = null;
    stopTimestamp = new Date();

    saveWorkTime(); // Jetzt speichern
  }
}

const buttonStyle = computed(() => ({
  backgroundColor: isRunning.value ? "#9a463d" : "#90AC8F",
  color: isRunning.value ? "#F2EDDB" : "black",
}));

// Reaktive Variable für den User-Namen
const userName = ref("");

// Beim Laden: Daten aus dem localStorage holen

function saveWorkTime() {
  const userData = localStorage.getItem("loggedInUser");
  if (!userData) {
    alert("Kein Benutzer eingeloggt.");
    return;
  }

  const user = JSON.parse(userData);
  const todayDate = new Date().toISOString().split("T")[0];

  const existingEntries = JSON.parse(localStorage.getItem("workTimes")) || [];

  const existingEntryIndex = existingEntries.findIndex(
    (entry) => entry.userId === user.id && entry.date === todayDate
  );

  const newHours = totalSeconds.value / 3600;
  const currentStart = startTimestamp
    ? startTimestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  let finalStartTime = currentStart;
  if (existingEntryIndex !== -1) {
    const existingStart = existingEntries[existingEntryIndex].start;

    if (currentStart) {
      const [h1, m1] = currentStart.split(":").map(Number);
      const [h2, m2] = existingStart.split(":").map(Number);

      const currentMinutes = h1 * 60 + m1;
      const existingMinutes = h2 * 60 + m2;
      finalStartTime = currentMinutes < existingMinutes ? currentStart : existingStart;
    } else {
      finalStartTime = existingEntries[existingEntryIndex].start;
    }
    existingEntries[existingEntryIndex] = {
      ...existingEntries[existingEntryIndex],
      start: finalStartTime,
      end: stopTimestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      workinghours: newHours,
    };
  } else {
    const newEntry = {
      userId: user.id,
      date: todayDate,
      start: currentStart,
      end: stopTimestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      workinghours: newHours,
    };
    existingEntries.push(newEntry);
  }

  localStorage.setItem("workTimes", JSON.stringify(existingEntries));
  loadTodayTimes();

  startTimestamp = null;
  stopTimestamp = null;

  console.log("Arbeitszeit erfolgreich gespeichert!");
  updateTodaysStoredHours();
}
onMounted(() => {
  const userData = localStorage.getItem("loggedInUser");
  if (userData) {
    const parsedUser = JSON.parse(userData);
    userName.value = `${parsedUser.vorname} ${parsedUser.nachname}`;
  }
  loadTodayTimes();
  updateTodaysStoredHours();
});
function loadTodayTimes() {
  const userData = localStorage.getItem("loggedInUser");
  if (!userData) return;

  const user = JSON.parse(userData);
  const todayDate = new Date().toISOString().split("T")[0];

  const existingEntries = JSON.parse(localStorage.getItem("workTimes")) || [];
  const todayEntry = existingEntries.find(
    (entry) => entry.userId === user.id && entry.date === todayDate
  );

  if (todayEntry) {
    storedStartTime.value = todayEntry.start;
    storedEndTime.value = todayEntry.end;
    totalSeconds.value = Math.round(parseFloat(todayEntry.workinghours) * 3600);
  } else {
    storedStartTime.value = "-";
    storedEndTime.value = "-";
    totalSeconds.value = 0;
  }
}

// Diese Computed Properties ergänzen:
const startTimeDisplay = computed(() => {
  return storedStartTime.value || "-";
});

const endTimeDisplay = computed(() => {
  return storedEndTime.value || "-";
});

const dailyProgress = computed(() => {
  const userData = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!userData) return 0;

  const targetHours = userData.arbeitszeitTyp === "Teilzeit" ? 6 : 8;
  const currentHours = totalSeconds.value / 3600;

  return Math.min(100, (currentHours / targetHours) * 100);
});
function updateTodaysStoredHours() {
  const userData = localStorage.getItem("loggedInUser");
  if (!userData) {
    todaysStoredHours.value = "0h 0min";
    return;
  }

  const user = JSON.parse(userData);
  const todayDate = new Date().toISOString().split("T")[0];
  const existingEntries = JSON.parse(localStorage.getItem("workTimes")) || [];
  const todayEntry = existingEntries.find(
    (entry) => entry.userId === user.id && entry.date === todayDate
  );

  if (!todayEntry) {
    todaysStoredHours.value = "0h 0min";
    return;
  }

  const totalHours = Math.floor(todayEntry.workinghours);
  const totalMinutes = Math.round((todayEntry.workinghours % 1) * 60);
  todaysStoredHours.value = `${totalHours}h ${totalMinutes}min`;
}
</script>

<template>
  <div class="wrapper">
    <header>
      <h1>Tagesansicht</h1>
      <navigation></navigation>
    </header>

    <main class="content">
      <h2 class="title">Hallo, {{ userName || "Benutzer" }}!</h2>
      <div class="halbkreis-wrapper">
        <svg class="halbkreis" viewBox="0 0 200 110">
          <!-- Hintergrundpfad -->
          <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="#e0e0e0" stroke-width="15" fill="none" />
          <!-- Fortschrittsbalken -->
          <path
          d="M 20 100 A 80 80 0 0 1 180 100"
  :stroke="totalSeconds > 3 ? 'url(#progressGradient)' : 'transparent'"
  stroke-width="15"
  fill="none"
  :stroke-dasharray="251.2"
  :stroke-dashoffset="totalSeconds > 1 ? (251.2 - (251.2 * dailyProgress / 100)) : 251.2"
  stroke-linecap="round"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="100%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4b8075" />
              <stop offset="100%" stop-color="#90AC8F" />
            </linearGradient>
          </defs>
        </svg>
        <Uhrzeit class="clock-centered" />
      </div>

      <div class="timer-box">
        <h1 class="title">Zeiterfassung</h1>
        <h2 class="title">{{ formattedTime }}</h2>
        <div class="info">
          <p><strong>Start:</strong> {{ startTimeDisplay }}</p>
          <p><strong>Ende:</strong> {{ endTimeDisplay }}</p>

          <p><strong>Gesamt heute:</strong> {{ todaysStoredHours }}</p>
        </div>
        <button @click="toggleTimer" :style="buttonStyle">
          {{ isRunning ? "Stop" : "Start" }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.clock-centered {
  margin-bottom: 10px;
}
* {
  box-sizing: border-box;
}

.info {
  font-size: 18px;
}
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f2eddb;
}

header {
  background-color: #f1ecdb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #ccc;
}

header h1 {
  font-size: 2rem;
  padding: 0.2rem 1rem;
  display: inline-block;
}

.logo {
  font-family: monospace;
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  background-color: white;
}

.title {
  font-size: 36px;
  margin-bottom: 20px;
  margin-top: 0;
}

.timer {
  font-size: 60px;
}

button {
  padding: 14px 55px;
  font-size: 25px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background-color: #90ac8f;
  font-family: "Georgia", serif;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  transform: scale(1.05);
}

.start {
  background-color: #90ac8f;
}

.stop {
  background-color: red;
}
.timer-box {
  background-color: #f2eddb;
  padding: 30px;
  border: 2px solid lightgray;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 450px;
}
.timer-box h2:first-of-type {
  font-size: 28px;
  margin-bottom: 10px;
}
/* Progress */
.halbkreis-wrapper {
  position: relative;
  width: 300px;
  height: 160px;
  margin-bottom: 1rem;
}

.halbkreis {
  width: 100%;
  height: 100%;
}

.halbkreis-wrapper > *:not(svg) {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
}
</style>
