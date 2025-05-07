<script setup>
import { ref, onMounted, computed } from "vue";
import { getWorkTimesByUser } from "@/utils/Arbeitszeiten";
import DayEditor from '@/components/DayEditor.vue';
const user = JSON.parse(localStorage.getItem("loggedInUser"));
const userId = user?.id ?? null;
const arbeitszeitTyp = user?.arbeitszeitTyp ?? "Vollzeit";
const forceUpdate = ref(0);
// Aktuelles Datum
const date = ref(new Date());
const days = ref([]);
const selectedDate = ref(null);
const filteredEntries = ref([]);

// Monat + Jahr als Computed Property
const monthYear = computed(() => {
  return `${date.value.toLocaleString("default", { month: "long" })} ${date.value.getFullYear()}`;
});

// Funktion, um den Kalender zu erstellen
function renderCalendar() {
  const year = date.value.getFullYear();
  const month = date.value.getMonth();

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sonntag
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tempDays = [];

  // Leere Felder für Tage vor dem 1.
  for (let i = 0; i < firstDay; i++) {
    tempDays.push("");
  }

  // Tage des Monats
  for (let i = 1; i <= daysInMonth; i++) {
    tempDays.push(i);
  }

  days.value = tempDays;
}

function prevMonth() {
  date.value = new Date(date.value.getFullYear(), date.value.getMonth() - 1, 1);
  renderCalendar();
}

function nextMonth() {
  date.value = new Date(date.value.getFullYear(), date.value.getMonth() + 1, 1);
  renderCalendar();
}

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

onMounted(() => {
  renderCalendar();
});

// Hilfsfunktion: Datum hübsch formatieren

// Hilfsfunktion: Überstunden / Minusstunden berechnen

function getDayClass(day) {
  if (!day) return "empty";

  const year = date.value.getFullYear();
  const month = String(date.value.getMonth() + 1).padStart(2, "0");
  const dayString = String(day).padStart(2, "0");
  const fullDate = `${year}-${month}-${dayString}`;

  const allUserEntries = getWorkTimesByUser(userId);
  const entry = allUserEntries.find((entry) => entry.date === fullDate);
  forceUpdate.value;
  const classes = [];

  if (urlaubDatesSet.has(fullDate)) {
    classes.push("urlaubstag");
  }

  if (entry) {
    // Dynamische Sollstunden je nach Arbeitszeittyp
    const sollStunden = arbeitszeitTyp === "Teilzeit" ? 6 : 8;
    const gearbeitet = parseFloat(entry.workinghours);
    classes.push(gearbeitet >= sollStunden ? "enough-worked" : "not-enough-worked");
 // normaler Tag ohne extra Farbe
  }
  return classes.join(" ");
}
function calculateDifference(workinghours) {
  forceUpdate.value;
  const sollStunden = arbeitszeitTyp === "Teilzeit" ? 6 : 8;
  return (parseFloat(workinghours) - sollStunden).toFixed(2);
}
const totalWorkingHours = computed(() => {
  const all = getWorkTimesByUser(userId);
  forceUpdate.value;
  const currentMonth = date.value.getMonth();
  const currentYear = date.value.getFullYear();

  return all
    .filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + parseFloat(e.workinghours), 0);
});

const workingDaysInMonth = computed(() => {
  forceUpdate.value;
  let workdays = 0;
  const year = date.value.getFullYear();
  const month = date.value.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month, d).getDay();
    if (day !== 0 && day !== 6) workdays++;
  }
  return workdays;
});

const monthlyTarget = computed(() => {
  forceUpdate.value;
  const hoursPerDay = arbeitszeitTyp === "Teilzeit" ? 6 : 8;
  return workingDaysInMonth.value * hoursPerDay;
});

const progressPercent = computed(() => {
  forceUpdate.value;
  return Math.min(100, (totalWorkingHours.value / monthlyTarget.value) * 100);
});

const monthlyOvertime = computed(() => {
  forceUpdate.value;
  return Math.max(0, totalWorkingHours.value - monthlyTarget.value);
});

const monthlyRemaining = computed(() => {
  forceUpdate.value;
  return Math.max(0, monthlyTarget.value - totalWorkingHours.value);
});
const reloadWorkTimes = () => {
  console.log("🔄 Kalender: reloadWorkTimes triggered");
  forceUpdate.value++; 
  if (selectedDate.value) {
    const selected = new Date(selectedDate.value);
    selectDate(selected.getDate());
  }
};
function getUrlaubDates(userId) {
  const urlaube = JSON.parse(localStorage.getItem("urlaube")) || [];
  const urlaubstage = new Set();

  urlaube
    .filter(u => u.userId === userId)
    .forEach(({ start, end }) => {
      const current = new Date(start);
      const last = new Date(end);
      while (current <= last) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) {
          urlaubstage.add(current.toISOString().split("T")[0]);
        }
        current.setDate(current.getDate() + 1);
      }
    });

  return urlaubstage;
}

const urlaubDatesSet = getUrlaubDates(userId);
</script>

<template>
  <div class="calendar">
    <div class="calendar-header">
        <button @click="prevMonth">←</button>
        <div>{{ monthYear }}</div>
        <button @click="nextMonth">→</button>
      </div>

    <div class="progress-section">
      <p>Geleistete Stunden: {{ totalWorkingHours.toFixed(2) }} / {{ monthlyTarget.toFixed(2) }} Stunden</p>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <p v-if="monthlyOvertime > 0">Überstunden: +{{ monthlyOvertime.toFixed(2) }} Stunden</p>
      <p v-else>Verbleibende Stunden: {{ monthlyRemaining.toFixed(2) }} Stunden</p>
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
    <DayEditor :userId="userId" :arbeitszeitTyp="arbeitszeitTyp" @workTimeSaved="reloadWorkTimes" />
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

.enough-worked {
  border: 2px solid #90AC8F; /* kräftiger grün Rand */
}

.not-enough-worked {
  border: 2px solid #dc3545; /* kräftiger rot Rand */
}
.arbeitszeiten-tabelle th,
.arbeitszeiten-tabelle td {
  border: 1px solid #ccc;
  padding: 0.75rem;
  text-align: center; /* Inhalte mittig */
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

.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f2eddb;
  font-family: "Inter", Arial, sans-serif;
  padding: 2rem;
}

header {
  background-color: #f2eddb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

header h1 {
  font-size: 2.5rem;
}

.logo {
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
.urlaubstag {
  border: 2px solid #5C6E91;
}

</style>
