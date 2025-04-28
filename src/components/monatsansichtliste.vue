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
  <div class="wochenansicht-container">
    <div class="wochen-navigation">
      <button @click="monthOffset--">← Vorheriger Monat</button>
      <span>
        {{ monthRange.start.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) }}
      </span>
      <button @click="monthOffset++">Nächster Monat →</button>
    </div>

    
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
  
</template>
  <style scoped>
  .wochenansicht-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 2rem;
  }
  
  .wochen-navigation {
    margin-bottom: 1rem;
  }
  
  .wochen-navigation button {
   
    border: none;
    
    padding: 8px 16px;
    margin: 0 10px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  }
  
 
  
  .tabelle-container {
    border: 2px solid #ccc;
    border-radius: 10px;
    padding: 20px;
    background-color: #fafafa;
    width: 100%;
    max-width: 900px;
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
  }
  
  
  th, td {
    padding: 12px;
    border: 1px solid #ddd;
  }
  
  tbody tr.odd-row {
    background-color: #f9f9f9;
  }
  
  tbody tr:hover {
    background-color: #f1f1f1;
  }
  </style>