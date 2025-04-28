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
    <div>
      <header>
        <h1>Monatsansicht</h1>
        <navigation></navigation>
        <div class="logo">🕒 <span>ETT</span></div>
      </header>
  
      <div class="wochenansicht-container">
        <h2>Arbeitszeiten – Monatsübersicht</h2>
  
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
            <tr v-for="(entry, index) in workTimes" :key="index">
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