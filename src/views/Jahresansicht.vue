<script setup>
import { ref } from 'vue'
import navigation from '@/components/navigation.vue';
import { getWorkTimesByUser } from '@/utils/Arbeitszeiten';
import { computed } from 'vue';

const user = JSON.parse(localStorage.getItem('loggedInUser'));
const userId = user?.id ?? null;
const arbeitszeitTyp = user?.arbeitszeitTyp ?? "Vollzeit";

const year = ref(new Date().getFullYear())

// Für jeden Monat: ausgewähltes Datum + gefilterte Einträge
const selectedDates = ref(Array(12).fill(null));
const filteredEntries = ref(Array(12).fill([]));

function renderMonthCalendar(month, year) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tempDays = [];
  for (let i = 0; i < firstDay; i++) tempDays.push('');
  for (let i = 1; i <= daysInMonth; i++) tempDays.push(i);
  return tempDays;
}

function getDayClass(day, month) {
  if (!day || !userId) return 'empty';

  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const fullDate = `${year.value}-${m}-${d}`;
  const isUrlaubstag = urlaubDatesSet.has(fullDate);
  const allUserEntries = getWorkTimesByUser(userId);
  const entry = allUserEntries.find(e => e.date === fullDate);
  if (isUrlaubstag) return 'urlaubstag';
  if (entry) {
    const sollStunden = arbeitszeitTyp === 'Teilzeit' ? 6 : 8;
    const gearbeitet = parseFloat(entry.workinghours);
    return gearbeitet >= sollStunden ? 'enough-worked' : 'not-enough-worked';
  }

  return '';
}

function selectDate(day, month) {
  if (!day || !userId) return;

  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const fullDate = `${year.value}-${m}-${d}`;

  selectedDates.value[month] = fullDate;

  const allUserEntries = getWorkTimesByUser(userId);
  filteredEntries.value[month] = allUserEntries.filter(e => e.date === fullDate);
}

function calculateDifference(workinghours) {
  const sollStunden = arbeitszeitTyp === 'Teilzeit' ? 6 : 8;
  return (parseFloat(workinghours) - sollStunden).toFixed(2);
}

function prevYear() {
  year.value--;
  selectedDates.value = Array(12).fill(null);
  filteredEntries.value = Array(12).fill([]);
}

function nextYear() {
  year.value++;
  selectedDates.value = Array(12).fill(null);
  filteredEntries.value = Array(12).fill([]);
}
const allEntries = getWorkTimesByUser(userId);

const totalHoursYear = computed(() => {
  return allEntries
    .filter(e => new Date(e.date).getFullYear() === year.value)
    .reduce((sum, entry) => sum + parseFloat(entry.workinghours), 0);
});

const workingDaysInYear = computed(() => {
  let workdays = 0;
  const currentYear = year.value;
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, m, d);
      const day = date.getDay();
      if (day !== 0 && day !== 6) workdays++; // Montag–Freitag
    }
  }
  return workdays;
});

const yearlyTarget = computed(() => {
  const hoursPerDay = arbeitszeitTyp === 'Teilzeit' ? 6 : 8;
  return workingDaysInYear.value * hoursPerDay;
});

const yearlyProgressPercent = computed(() => {
  return Math.min(100, (totalHoursYear.value / yearlyTarget.value) * 100);
});
const yearlyRemainingHours = computed(() => {
  return Math.max(0, yearlyTarget.value - totalHoursYear.value);
});

const yearlyOvertime = computed(() => {
  return Math.max(0, totalHoursYear.value - yearlyTarget.value);
});



//URLAUB
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
     <header>
      <h1>Jahresansicht</h1>
      <navigation></navigation>
    </header>
  
    <div class="year-header">
      <button @click="prevYear">←</button>
      <h2>{{ year }}</h2>
      <button @click="nextYear">→</button>
    </div>
    <div class="jahresarbeitszeit-balken">
      <p>Geleistete Stunden: {{ totalHoursYear.toFixed(2) }} / {{ yearlyTarget.toFixed(2) }} Stunden</p>
<div class="progress-bar-container">
  <div class="progress-bar" :style="{ width: yearlyProgressPercent + '%' }"></div>
</div>
<p v-if="totalHoursYear > yearlyTarget">
  Überstunden: +{{ yearlyOvertime.toFixed(2) }} Stunden
</p>
<p v-else>
  Verbleibende Stunden: {{ yearlyRemainingHours.toFixed(2) }} Stunden
</p>

</div>
    <div class="year-grid">
      <div v-for="month in 12" :key="month" class="month">
        <h3>{{ new Date(year, month - 1).toLocaleString('default', { month: 'long' }) }}</h3>
  
        <div class="calendar-days">
          <div v-for="d in ['So','Mo','Di','Mi','Do','Fr','Sa']" :key="d">{{ d }}</div>
        </div>
  
        <div class="calendar-dates">
          <div 
            v-for="(day, idx) in renderMonthCalendar(month - 1, year)" 
            :key="idx"
            :class="getDayClass(day, month - 1)"
            @click="selectDate(day, month - 1)">
            {{ day }}
          </div>
        </div>
  
        <!-- Einträge direkt unter dem Monat -->
        <div v-if="selectedDates[month - 1]" class="entries-section">
          <h4>Zeiteinträge für {{ new Date(selectedDates[month - 1]).toLocaleDateString('de-DE') }}</h4>
  
          <div v-if="filteredEntries[month - 1].length">
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
                <tr v-for="(entry, index) in filteredEntries[month - 1]" :key="index">
                  <td>{{ entry.start }}</td>
                  <td>{{ entry.end }}</td>
                  <td>{{ Number(entry.workinghours).toFixed(2) }}</td>
                  <td>{{ calculateDifference(entry.workinghours) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else>Keine Zeiteinträge für diesen Tag.</p>
        </div>
      </div>
    </div>
  </template>
  <style scoped>
.urlaubstag {
  border: 2px solid #5C6E91 !important;
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

.year-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.year-header button {
  background-color: #f3e9d2;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  font-size: 17px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.year-header button:hover {
  background-color: #e0dcca;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 1rem;
}

.month {
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.enough-worked {
  border: 2px solid #90AC8F !important;
}

.not-enough-worked {
  border: 2px solid #9A463D !important;
}

.month h3 {
  text-align: center;
  margin-bottom: 0.5rem;
}

.calendar-dates div:hover {
  background-color: #d1e0ff;
  cursor: pointer;
}

.enough-worked:hover,
.not-enough-worked:hover {
  opacity: 0.9;
}

.calendar-days,
.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  gap: 0.2rem;
}

.calendar-days div {
  font-weight: bold;
  font-size: 0.75rem;
  color: #555;
}

.calendar-dates div {
  height: 30px;
  font-size: 0.75rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.calendar-dates div.empty {
  background-color: transparent;
  cursor: default;
}

.jahresarbeitszeit-balken {
  margin: 1rem auto 2rem auto;
  text-align: center;
  font-size: 1rem;
  max-width: 600px;
  font-weight: bold;
}

.progress-bar-container {
  width: 100%;
  height: 20px;
  background-color: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin: 0.5rem auto;
}

.progress-bar {
  height: 100%;
  background-color: #90AC8F;
  transition: width 0.3s ease-in-out;
}

table.arbeitszeiten-tabelle {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 0.9rem;
  border-radius: 10px;
  overflow: hidden;
}

.arbeitszeiten-tabelle th,
.arbeitszeiten-tabelle td {
  border: 1px solid #e0dccc;
  padding: 8px;
  text-align: center;
}

.arbeitszeiten-tabelle thead tr {
  background-color: #f3e9d2;
}

.arbeitszeiten-tabelle tbody tr:nth-child(even) {
  background-color: #f9f6f1;
}

.arbeitszeiten-tabelle tbody tr:last-child {
  background-color: #ffffff;
}

.entries-section {
  background-color: #ffffff; /* Weiß statt beige */
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.entries-section h4 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #444;
}

@media (max-width: 768px) {
  .year-grid {
    grid-template-columns: 1fr;
  }

  .arbeitszeiten-tabelle {
    font-size: 0.8rem;
  }
}
.arbeitszeiten-tabelle tbody tr:last-child td {
  background-color: #ffffff;
  border: 1px solid #e0dccc;
}
</style>