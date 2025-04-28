<script setup>
import { ref, onMounted, computed } from 'vue'
import Uhrzeit from '@/components/Uhrzeit.vue'


// Aktuelles Datum
const date = ref(new Date());

// Arrays für Tage im Kalender
const days = ref([]);

// Monat + Jahr als Computed Property
const monthYear = computed(() => {
  return `${date.value.toLocaleString('default', { month: 'long' })} ${date.value.getFullYear()}`
})

// Funktion, um den Kalender zu erstellen
function renderCalendar() {
  const year = date.value.getFullYear();
  const month = date.value.getMonth();

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sonntag
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tempDays = [];

  // Leere Felder für Tage vor dem 1.
  for (let i = 0; i < firstDay; i++) {
    tempDays.push('');
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


onMounted(() => {
  renderCalendar();
})

// Dummy für Zeiteinträge
const filteredEntries = ref([]);
const selectedDate = ref(null);
</script>

<template>
  

    <div class="calendar">
      <div class="calendar-header">
        <button @click="prevMonth">‹</button>
        <div>{{ monthYear }}</div>
        <button @click="nextMonth">›</button>
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
        <div v-for="(day, index) in days" :key="index">
          {{ day }}
        </div>
      </div>
    </div>

    <div v-if="filteredEntries.length">
      <div v-for="entry in filteredEntries" :key="entry.start + entry.project" class="entry">
        <p><strong>Projekt:</strong> {{ entry.project }}</p>
        <p><strong>Start:</strong> {{ entry.start }} - <strong>Ende:</strong> {{ entry.end }}</p>
      </div>
    </div>
    <p v-else-if="selectedDate">Keine Zeiteinträge für diesen Tag.</p>
  
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F2EDDB;
  font-family: 'Inter', Arial, sans-serif;
  padding: 2rem;
}

header {
  background-color: #F2EDDB;
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
  background-color: #ddd;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.calendar-header button:hover {
  background-color: #ccc;
}

.calendar-days, .calendar-dates {
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

.entry {
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
</style>