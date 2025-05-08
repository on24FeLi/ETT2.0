<script setup>
import { ref, computed } from 'vue';
import navigation from '@/components/navigation.vue';
import { getWorkTimesByUser } from '@/utils/Arbeitszeiten';
import DayEditor from '@/components/DayEditor.vue';


// Eingeloggten Benutzer laden
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const userId = user?.id ?? null;
const arbeitszeitTyp = user?.arbeitszeitTyp ?? "Vollzeit";

// Hilfsfunktion: Uhrzeit aus Datum entfernen (nur Datum vergleichen)
function toDateOnly(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Wochenstart (Montag) berechnen
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sonntag, 1 = Montag, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mo = 1, So = 0 → -6
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0); // nur Datum
  return monday;
}

// Offset zur aktuellen Woche (0 = diese Woche, -1 = letzte Woche, etc.)
const weekOffset = ref(0);

// Start & Ende der Woche berechnen
const weekRange = computed(() => {
  const today = new Date();
  const baseDate = new Date(today.setDate(today.getDate() + weekOffset.value * 7));
  const start = getStartOfWeek(baseDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // bis Sonntag
  return { start, end };
});

// Gefilterte Arbeitszeiten für aktuelle Woche
const workTimes = computed(() => {
  forceUpdate.value; // Trigger für Neuberechnung
  if (!userId) return [];
  const allTimes = getWorkTimesByUser(userId);
  return allTimes.filter(entry => {
    const entryDate = toDateOnly(entry.date);
    const start = toDateOnly(weekRange.value.start);
    const end = toDateOnly(weekRange.value.end);
    return entryDate >= start && entryDate <= end;
  });
});
const sortedWorkTimes = computed(() => {
  const weekdayOrder = { 'Mo': 1, 'Di': 2, 'Mi': 3, 'Do': 4, 'Fr': 5, 'Sa': 6, 'So': 7 };

  return [...workTimes.value].sort((a, b) => {
    const aDay = getWeekdayAbbreviation(a.date);
    const bDay = getWeekdayAbbreviation(b.date);
    return weekdayOrder[aDay] - weekdayOrder[bDay];
  });
});
const sollStunden = computed(() => {
  if (arbeitszeitTyp === 'Teilzeit') {
    return 6; // Teilzeit: 6 Stunden
  }
  return 8; // Vollzeit: 8 Stunden
});
function getWeekdayAbbreviation(dateString) {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const date = new Date(dateString);
  return days[date.getDay()];
}
const totalWorkingHours = computed(() => {
  return workTimes.value.reduce((sum, entry) => sum + parseFloat(entry.workinghours), 0);
});

// Sollstunden pro Woche
const weeklyTarget = computed(() => {
  return arbeitszeitTyp === 'Teilzeit' ? 30 : 40;
});

// Prozentualer Fortschritt
const progressPercent = computed(() => {
  return Math.min(100, (totalWorkingHours.value / weeklyTarget.value) * 100);
});

// Verbleibende Stunden
const remainingHours = computed(() => {
  return Math.max(0, weeklyTarget.value - totalWorkingHours.value);
});


//HINZUFÜGEN BUTTON
const forceUpdate = ref(0); // Trigger für Neuberechnung


const reloadWorkTimes = () => {
  console.log("🔁 reloadWorkTimes triggered");
  forceUpdate.value++;
};
</script>

<template>
    <div>
      <header>
      <h1>Wochenansicht</h1>
      <navigation></navigation>
      </header>
  
      <div class="wochenansicht-container">
        <h2>Arbeitszeiten – Wochenübersicht</h2>
  
        <div class="wochen-navigation">
          <button @click="weekOffset--">←</button>
          <span>
            {{ weekRange.start.toLocaleDateString('de-DE') }} – {{ weekRange.end.toLocaleDateString('de-DE') }}
          </span>
          <button @click="weekOffset++">→</button>
        </div>
        <div class="arbeitsstunden-balken">
  <p>Geleistete Stunden: {{ totalWorkingHours.toFixed(2) }} / {{ weeklyTarget }} Stunden</p>
  <div class="progress-bar-container">
    <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
  </div>
  <p v-if="totalWorkingHours > weeklyTarget">
  Überstunden: +{{ (totalWorkingHours - weeklyTarget).toFixed(2) }} 
</p>
<p v-else>
  Verbleibende Stunden: {{ remainingHours.toFixed(2) }} 
</p>
</div>
        <table v-if="workTimes.length">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Datum</th>
              <th>Beginn</th>
              <th>Ende</th>
              <th>Arbeitszeit
              </th>
              <th>Überstunden / Minusstunden</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in sortedWorkTimes" :key="index">
              <td>{{ getWeekdayAbbreviation(entry.date) }}</td>
              <td>{{ new Date(entry.date).toLocaleDateString('de-DE') }}</td>
              <td>{{ entry.start }}</td>
              <td>{{ entry.end }}</td>
              <td>{{ Number(entry.workinghours).toFixed(2) }}</td>
              <td>
        {{ (entry.workinghours - sollStunden).toFixed(2) }}
      </td>
            </tr>
          </tbody>
        </table>
  
        <p v-else>Keine Einträge für diese Woche.</p>
        <DayEditor :userId="userId" :arbeitszeitTyp="arbeitszeitTyp" @workTimeSaved="reloadWorkTimes" />
      </div>
    </div>
  </template>

<style scoped>
.arbeitsstunden-balken {
  margin-top: 2rem;
  text-align: center;
  font-weight: bold;
}

.progress-bar-container {
  width: 100%;
  height: 20px;
  background-color: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin: 0.5rem auto;
  max-width: 600px;
}

.progress-bar {
  height: 100%;
  background-color: #90AC8F;
  transition: width 0.3s ease-in-out;
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
.wochenansicht-container {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

h2 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 1.5rem;
  text-align: center;
}

.wochen-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.wochen-navigation button {
  background-color: #f3e9d2;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  font-size: 17px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.wochen-navigation button:hover {
  background-color: #e0dcca;
}

.wochen-navigation span {
  font-size: 1.1rem;
  font-weight: bold;
  
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

th, td {
  padding: 0.75rem 1rem;
  border: 1px solid #e0dccc;
  text-align: left;
}

th {
  background-color: #f1ecdb;
  font-weight: 600;
}
tbody tr:nth-child(even) {
  background-color: #fdfbf5;
}

tbody tr:hover {
  background-color: #f5f0e4;
  transition: background-color 0.2s ease;
}
p {
  text-align: center;
  font-size: 1.1rem;
}

</style>
