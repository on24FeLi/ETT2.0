<script setup>
import { ref, onMounted, computed } from "vue";
import { getWorkTimesByUser } from "@/utils/Arbeitszeiten";
const props = defineProps({
  urlaubsliste: {
    type: Array,
    default: () => []
  }
});
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

// Tag-Klasse (neutral, keine Farben)
function getDayClass(day) {
  if (!day) return "empty";
  return isUrlaubstag(day) ? "urlaubstag" : "";
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
function isUrlaubstag(day) {
  if (!day) return false;

  const currentYear = date.value.getFullYear();
  const currentMonth = String(date.value.getMonth() + 1).padStart(2, "0");
  const currentDay = String(day).padStart(2, "0");

  const fullDate = `${currentYear}-${currentMonth}-${currentDay}`;

  return props.urlaubsliste.some(u => {
    return fullDate >= u.start && fullDate <= u.end;
  });
}


</script>
<template>
  <div class="calendar">
    <div class="calendar-header">
        <button @click="prevMonth">←</button>
        <div>{{ monthYear }}</div>
        <button @click="nextMonth">→</button>
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
<!--
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
-->
  </div>
</template>
<style scoped>
.urlaubstag {
  border: 3px solid #5C6E91;
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

.calendar {
  width: 500px;         /* Feste Breite, kein % */
  min-width: 320px;     /* Schutz gegen Schrumpfen */
  max-width: 500px;     /* Optional: kein Wachsen */
  flex-shrink: 0;       /* Damit Flexbox es nicht verkleinert */
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