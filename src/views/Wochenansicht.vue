<script setup>
import { ref, computed } from 'vue';
import navigation from '@/components/navigation.vue';
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
  if (!userId) return [];
  const allTimes = getWorkTimesByUser(userId);
  return allTimes.filter(entry => {
    const entryDate = toDateOnly(entry.date);
    const start = toDateOnly(weekRange.value.start);
    const end = toDateOnly(weekRange.value.end);
    return entryDate >= start && entryDate <= end;
  });
});
const sollStunden = computed(() => {
  if (arbeitszeitTyp === 'Teilzeit') {
    return 6; // Teilzeit: 6 Stunden
  }
  return 8; // Vollzeit: 8 Stunden
});
</script>

<template>
    <div>
      <header>
      <h1>Wochenansicht</h1>
      <navigation></navigation>
      <div class="logo">🕒 <span>ETT</span></div>
    </header>
  
      <div class="wochenansicht-container">
        <h2>Arbeitszeiten – Wochenübersicht</h2>
  
        <div class="wochen-navigation">
          <button @click="weekOffset--">← Vorherige Woche</button>
          <span>
            {{ weekRange.start.toLocaleDateString('de-DE') }} – {{ weekRange.end.toLocaleDateString('de-DE') }}
          </span>
          <button @click="weekOffset++">Nächste Woche →</button>
        </div>
  
        <table v-if="workTimes.length">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Beginn</th>
              <th>Ende</th>
              <th>Stunden</th>
              <th>Überstunden / Minusstunden</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in workTimes" :key="index">
              <td>{{ new Date(entry.date).toLocaleDateString('de-DE') }}</td>
              <td>{{ entry.start }}</td>
              <td>{{ entry.end }}</td>
              <td>{{ entry.workinghours }}</td>
              <td>{{ (entry.workinghours - sollStunden).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
  
        <p v-else>Keine Einträge für diese Woche.</p>
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
  background-color: #e5e5e5;
  color: #222;
  border: 1px solid #aaa;
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.wochen-navigation button:hover {
  background-color: #d4d4d4;
}

.wochen-navigation span {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  border: 1px solid #ccc;
  padding: 0.75rem;
  text-align: left;
}

th {
  background-color: #f0f0f0;
  font-weight: bold;
  color: #222;
}

td {
  background-color: #fff;
  color: #333;
}

tbody tr:nth-child(even) td {
  background-color: #f9f9f9;
}

tbody tr:hover td {
  background-color: #f0f0f0;
}

p {
  text-align: center;
  margin-top: 2rem;
  font-size: 1.1rem;
  color: #666;
}
</style>
