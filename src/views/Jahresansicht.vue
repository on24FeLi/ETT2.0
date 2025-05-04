<script setup>
import { ref } from 'vue'
import navigation from '@/components/navigation.vue';
import { getWorkTimesByUser } from '@/utils/Arbeitszeiten'

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

  const allUserEntries = getWorkTimesByUser(userId);
  const entry = allUserEntries.find(e => e.date === fullDate);

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
</script>
<template>
     <header>
      <h1>Jahresansicht</h1>
      <navigation></navigation>
    </header>
  
    <div class="year-header">
      <button @click="prevYear">‹</button>
      <h2>{{ year }}</h2>
      <button @click="nextYear">›</button>
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
                  <td>{{ entry.workinghours }}</td>
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
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }
  .enough-worked {
  background-color: #d4edda; /* sanftes Grün */
  border: 1px solid #28a745;
  color: #155724;
  font-weight: bold;
}

.not-enough-worked {
  background-color: #f8d7da; /* sanftes Rot */
  border: 1px solid #dc3545;
  color: #721c24;
  font-weight: bold;
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
  .calendar-days, .calendar-dates {
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
  </style>