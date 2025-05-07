<script setup>
import { ref, onMounted, computed } from "vue";
import { getWorkTimesByUser } from "@/utils/Arbeitszeiten";

// Benutzerinfo
const user = JSON.parse(localStorage.getItem("loggedInUser"));
const userId = user?.id ?? null;
const arbeitszeitTyp = user?.arbeitszeitTyp ?? "Vollzeit";

const forceUpdate = ref(0);
const date = ref(new Date());
const days = ref([]);
const selectedDate = ref(null);
const filteredEntries = ref([]);

// Monat + Jahr
const monthYear = computed(() => {
  return `${date.value.toLocaleString("default", { month: "long" })} ${date.value.getFullYear()}`;
});

// Kalender anzeigen
function renderCalendar() {
  const year = date.value.getFullYear();
  const month = date.value.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tempDays = [];
  for (let i = 0; i < firstDay; i++) tempDays.push("");
  for (let i = 1; i <= daysInMonth; i++) tempDays.push(i);

  days.value = tempDays;
}

// Navigation
function prevMonth() {
  date.value = new Date(date.value.getFullYear(), date.value.getMonth() - 1, 1);
  renderCalendar();
}

function nextMonth() {
  date.value = new Date(date.value.getFullYear(), date.value.getMonth() + 1, 1);
  renderCalendar();
}

// Auswahl Tag
function selectDate(day) {
  if (!day || !userId) return;

  const year = date.value.getFullYear();
  const month = String(date.value.getMonth() + 1).padStart(2, "0");
  const dayString = String(day).padStart(2, "0");
  const fullDate = `${year}-${month}-${dayString}`;

  selectedDate.value = fullDate;

  const allUserEntries = getWorkTimesByUser(userId);
  filteredEntries.value = allUserEntries.filter((entry) => entry.date === fullDate);
}

// Tag-Klasse (Farben für gearbeitet/nicht gearbeitet)
function getDayClass(day) {
  if (!day) return "empty";

  const year = date.value.getFullYear();
  const month = String(date.value.getMonth() + 1).padStart(2, "0");
  const dayString = String(day).padStart(2, "0");
  const fullDate = `${year}-${month}-${dayString}`;

  const allUserEntries = getWorkTimesByUser(userId);
  const entry = allUserEntries.find((entry) => entry.date === fullDate);
  forceUpdate.value;

  if (entry) {
    const sollStunden = arbeitszeitTyp === "Teilzeit" ? 6 : 8;
    const gearbeitet = parseFloat(entry.workinghours);
    return gearbeitet >= sollStunden ? "enough-worked" : "not-enough-worked";
  }
  return "";
}

// Differenz berechnen
function calculateDifference(workinghours) {
  forceUpdate.value;
  const sollStunden = arbeitszeitTyp === "Teilzeit" ? 6 : 8;
  return (parseFloat(workinghours) - sollStunden).toFixed(2);
}

onMounted(() => {
  renderCalendar();
});
</script>

<template>
  <div class="calendar">
    <div class="calendar-header">
        <button @click="prevMonth">←</button>
        <div>{{ monthYear }}</div>
        <button @click="nextMonth">→</button>
    </div>

    <div class="progress-section">
      <div class="progress-bar-container">
        <div class="progress-bar"></div>
      </div>
    </div>

    <div class="calendar-days">
      <div>Sun</div>
      <div>Mon</div>
      <div>Tue</div>
      <div>Wed</div>
      <div>Thu</div>
      <div>Fri</div>
      <div>Sat</div>
    </div>

    <div class="calendar-dates">
      <div
        v-for="(day, index) in days"
        :key="index"
        :class="getDayClass(day)"
        @click="selectDate(day)"
      >
        {{ day }}
      </div>
    </div>

    <div v-if="selectedDate" class="entries-section">
      <h4>Zeiteinträge für den {{ new Date(selectedDate).toLocaleDateString("de-DE") }}</h4>

      <div v-if="filteredEntries.length">
        <table class="arbeitszeiten-tabelle">
          <thead>
            <tr>
              <th>Beginn</th>
              <th>Ende</th>
              <th>Arbeitszeit (h)</th>
              <th>Überstunden</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in filteredEntries" :key="index">
              <td>{{ entry.start }}</td>
              <td>{{ entry.end }}</td>
              <td>{{ entry.workinghours }}</td>
              <td>{{ calculateDifference(entry.workinghours) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else>Keine Zeiteinträge für diesen Tag.</p>
    </div>
  </div>
</template>

<style scoped>
.progress-section {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.progress-bar-container {
  width: 100%;
  max-width: 450px;
  height: 20px;
  background-color: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin: 0.5rem auto;
}

.progress-bar {
  height: 100%;
  background-color: #90ac8f;
  transition: width 0.3s ease-in-out;
}

.arbeitszeiten-tabelle {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.arbeitszeiten-tabelle th,
.arbeitszeiten-tabelle td {
  border: 1px solid #ccc;
  padding: 0.75rem;
  text-align: center;
  vertical-align: middle;
}

.arbeitszeiten-tabelle th {
  background-color: #f0f0f0;
  font-weight: bold;
}

.arbeitszeiten-tabelle tr:nth-child(even) {
  background-color: #fafafa;
}

.arbeitszeiten-tabelle tr:hover {
  background-color: #e6f7ff;
}

.enough-worked {
  background-color: #d4edda;
  border: 2px solid #28a745;
  color: #155724;
  font-weight: bold;
}

.not-enough-worked {
  background-color: #f8d7da;
  border: 2px solid #dc3545;
  color: #721c24;
  font-weight: bold;
}

.calendar {
  margin: 2rem auto;
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-header button {
  background-color: #f3e9d2;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  font-size: 17px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.calendar-header button:hover {
  background-color: #e0dcca;
}

.calendar-days,
.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  gap: 0.5rem;
}

.calendar-days div {
  font-weight: bold;
  padding: 0.5rem 0;
  color: #555;
}

.calendar-dates div {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  font-weight: 500;
}

.calendar-dates div:hover {
  background-color: #d1e0ff;
  cursor: pointer;
}

.calendar-dates div.empty {
  background-color: transparent;
  cursor: default;
}

.entries-section {
  margin-top: 2rem;
  width: 300px;
}

.entry {
  background: white;
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>