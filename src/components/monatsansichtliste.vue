<script setup>
import { ref, computed } from "vue";
import DayEditor from '@/components/DayEditor.vue';
import { getWorkTimesByUser } from "@/utils/Arbeitszeiten";

// Eingeloggten Benutzer laden
const user = JSON.parse(localStorage.getItem("loggedInUser"));
const userId = user?.id ?? null;
const arbeitszeitTyp = user?.arbeitszeitTyp ?? "Vollzeit";
const forceUpdate = ref(0);
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
  forceUpdate.value;
  if (!userId) return [];
  const allTimes = getWorkTimesByUser(userId);
  return allTimes.filter((entry) => {
    const entryDate = toDateOnly(entry.date);
    const start = toDateOnly(monthRange.value.start);
    const end = toDateOnly(monthRange.value.end);
    return entryDate >= start && entryDate <= end;
  });
});

// Soll-Stunden pro Tag
const sollStunden = computed(() => {
  return arbeitszeitTyp === "Teilzeit" ? 6 : 8;
});

// Hilfsfunktion: Wochentags-Abkürzung
function getWeekdayAbbreviation(dateString) {
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const date = new Date(dateString);
  return days[date.getDay()];
}
// Monatliche Gesamtstunden
const totalWorkingHours = computed(() => {
  forceUpdate.value;
  return workTimes.value.reduce((sum, entry) => sum + parseFloat(entry.workinghours), 0);
});

// Anzahl Arbeitstage (Mo–Fr) im aktuellen Monat
const workingDaysInMonth = computed(() => {
  let workdays = 0;
  const start = monthRange.value.start;
  const end = monthRange.value.end;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) workdays++;
  }
  return workdays;
});

// Monatliches Soll
const monthlyTarget = computed(() => {
  return workingDaysInMonth.value * sollStunden.value;
});

// Fortschritt in Prozent
const progressPercent = computed(() => {
  return Math.min(100, (totalWorkingHours.value / monthlyTarget.value) * 100);
});

// Überstunden / Minusstunden
const monthlyOvertime = computed(() => {
  return Math.max(0, totalWorkingHours.value - monthlyTarget.value);
});
const monthlyRemaining = computed(() => {
  return Math.max(0, monthlyTarget.value - totalWorkingHours.value);
});
const reloadWorkTimes = () => {
  console.log("🔄 Monatsansicht aktualisiert");
  forceUpdate.value++;
};
</script>
<template>
  <navigation></navigation>
  <div class="monatsansicht-container">
    <div class="monatsansicht-table-container">
      <div class="monatsansicht-navigation">
        <button @click="monthOffset--">←</button>
        <span>
          {{ monthRange.start.toLocaleDateString("de-DE", { month: "long", year: "numeric" }) }}
        </span>
        <button @click="monthOffset++">→</button>
      </div>
      <div class="monatsarbeitszeit-balken">
        <p>
          Geleistete Stunden: {{ totalWorkingHours.toFixed(2) }} /
          {{ monthlyTarget.toFixed(2) }} Stunden
        </p>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <p v-if="monthlyOvertime > 0">Überstunden: +{{ monthlyOvertime.toFixed(2) }} Stunden</p>
        <p v-else>Verbleibende Stunden: {{ monthlyRemaining.toFixed(2) }} Stunden</p> 
       <p v-else>Keine Einträge für diesen Monat.</p>
      </div>
      <div class="table-wrapper" v-if="workTimes.length">
  <table class="scroll-table">
    <thead>
      <tr>
        <th>Tag</th>
        <th>Datum</th>
        <th>Beginn</th>
        <th>Ende</th>
        <th>Arbeitszeit</th>
        <th>+/- Stunden</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(entry, index) in workTimes"
        :key="index"
      >
        <td>{{ getWeekdayAbbreviation(entry.date) }}</td>
        <td>{{ new Date(entry.date).toLocaleDateString("de-DE") }}</td>
        <td>{{ entry.start }}</td>
        <td>{{ entry.end }}</td>
        <td>{{ entry.workinghours }}</td>
        <td>
          {{ (entry.workinghours - sollStunden).toFixed(2) }}
        </td>
      </tr>
    </tbody>
  </table>
</div>
 
<DayEditor :userId="userId" :arbeitszeitTyp="arbeitszeitTyp" @workTimeSaved="reloadWorkTimes" />
   
    </div>
  </div>
</template>
<style scoped>
.monatsarbeitszeit-balken {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.progress-bar-container {
  width: 100%;
  height: 20px;
  background-color: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress-bar {
  height: 100%;
  background-color: #90ac8f;
  transition: width 0.3s ease-in-out;
}
.monatsansicht-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  
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
  font-size: 0.95rem;
  background-color: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

th,
td {
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
  margin-top: 2rem;
}

.table-wrapper {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0dccc;
  border-radius: 8px;
}

.scroll-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 700px;
  table-layout: fixed;
}

.scroll-table th {
  position: sticky;
  top: 0;
  background-color: #f1ecdb;
  z-index: 2;
  padding: 0.75rem 1rem;
  font-weight: 600;
  border-bottom: 1px solid #e0dccc;
  text-align: left;
}


.scroll-table tbody td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0dccc;
  background-color: #fff;
  text-align: left;
  word-wrap: break-word;
}

.scroll-table tbody tr:nth-child(even) td {
  background-color: #fdfbf5;
}

.scroll-table tbody tr:hover td {
  background-color: #f5f0e4;
  transition: background-color 0.2s ease;
}

</style>


