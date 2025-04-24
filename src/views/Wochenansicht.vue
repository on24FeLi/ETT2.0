<script setup>
import { ref, computed } from 'vue';
import navigation from '@/components/navigation.vue';
import { getWorkTimesByUser } from '@/utils/Arbeitszeiten';

// Eingeloggten Benutzer laden
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const userId = user?.id ?? null;

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
</script>

<template>
    <div>
      <navigation />
  
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
              <td>{{ entry.workinghours-8 }}</td>
            </tr>
          </tbody>
        </table>
  
        <p v-else>Keine Einträge für diese Woche.</p>
      </div>
    </div>
  </template>

<style scoped>
.wochenansicht-container {
  padding: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 0.5rem;
  border: 1px solid #ccc;
  text-align: left;
}
</style>
