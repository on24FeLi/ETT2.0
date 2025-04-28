<script setup>
import { ref, computed } from 'vue';

import { getWorkTimesByUser } from '@/utils/Arbeitszeiten';

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

// Monatsstart (erster Tag des Monats) berechnen
function getStartOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Offset zum aktuellen Monat (0 = dieser Monat, -1 = letzter Monat, etc.)
const monthOffset = ref(0);

// Start & Ende des Monats berechnen
const monthRange = computed(() => {
  const today = new Date();
  today.setMonth(today.getMonth() + monthOffset.value);
  const start = getStartOfMonth(today);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0); // letzter Tag des Monats
  end.setHours(0, 0, 0, 0);
  return { start, end };
});

// Gefilterte Arbeitszeiten für aktuellen Monat
const workTimes = computed(() => {
  if (!userId) return [];
  const allTimes = getWorkTimesByUser(userId);
  return allTimes.filter(entry => {
    const entryDate = toDateOnly(entry.date);
    const start = toDateOnly(monthRange.value.start);
    const end = toDateOnly(monthRange.value.end);
    return entryDate >= start && entryDate <= end;
  });
});

// Soll-Stunden pro Tag
const sollStunden = computed(() => {
  return arbeitszeitTyp === 'Teilzeit' ? 6 : 8;
});

// Hilfsfunktion: Wochentags-Abkürzung
function getWeekdayAbbreviation(dateString) {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const date = new Date(dateString);
  return days[date.getDay()];
}
</script>
<template>
  <div class="monatsansicht-container">
    <div class="monatsansicht-navigation">
      <button @click="monthOffset--">←</button>
      <span>
        {{ monthRange.start.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) }}
      </span>
      <button @click="monthOffset++">→</button>
    </div>

    <div class="monatsansicht-table-container">
      <table v-if="workTimes.length">
        <thead>
          <tr>
            <th>Tag</th>
            <th>Datum</th>
            <th>Beginn</th>
            <th>Ende</th>
            <th>Arbeitszeit</th>
            <th>Überstunden / Minusstunden</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in workTimes" :key="index" :class="{ 'odd-row': index % 2 === 1 }">
            <td>{{ getWeekdayAbbreviation(entry.date) }}</td>
            <td>{{ new Date(entry.date).toLocaleDateString('de-DE') }}</td>
            <td>{{ entry.start }}</td>
            <td>{{ entry.end }}</td>
            <td>{{ entry.workinghours }}</td>
            <td>{{ (entry.workinghours - sollStunden).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else>Keine Einträge für diesen Monat.</p>
    </div>
  </div>
</template>
<style scoped>
.monatsansicht-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  margin-top: 2rem;
}

.monatsansicht-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.monatsansicht-navigation button {
  background-color: #f3e9d2;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  font-size: 17px;
  cursor: pointer;
  transition: background-color 0.3s ease;

}

.monatsansicht-navigation button:hover {
  background-color: #e0dcca;
}

.monatsansicht-table-container {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  max-width: 900px;
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

th, td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f3e9d2;
  font-weight: bold;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr:hover {
  background-color: #f0f0f0;
}

tbody tr.odd-row {
  background-color: #ffffff;
}

p {
  text-align: center;
  margin-top: 2rem;
  color: #666;
}
</style>