<script setup>
import { ref, computed, onMounted } from "vue";
import navigation from '@/components/navigation.vue';
import CleanKalenderansicht from '@/components/CleanKalenderansicht.vue';
//import {urlaube} from '@/utils/Urlaubszeiten';

// Platzhalter-Komponente für Storno-/Verschiebe-Buttons
const PlatzhalterAktion = {
  template: '<div><button class="aktion-btn">⚙️</button></div>'
};
</script>

<template>
  <div>
    <header>
      <h1>Urlaub</h1>
      <navigation/>
      </header>
          <!-- Flex-Container -->
    <div class="urlaub-container">
      <form class="urlaub-formular" action="/submit-urlaub" method="post">
        <label for="startdatum">Urlaubsbeginn</label>
        <input type="date" id="startdatum" name="startdatum" required>

        <label for="enddatum">Urlaubsende</label>
        <input type="date" id="enddatum" name="enddatum" required>

        <label for="nachricht">Kommentar (optional)</label>
        <textarea id="nachricht" name="nachricht" rows="4"></textarea>

        <button type="submit">Antrag senden</button>
      </form>
      <!-- Kalender -->
      <div class="calendar-wrapper">
        <CleanKalenderansicht />
      </div>
    </div>
    </div>
</template>

<style scoped>
/* ========== HEADER ========== */
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
}

/* ========== CONTAINER ========== */
.urlaub-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap; /* ← wichtig */
  gap: 3rem;
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
}


/* ========== FORMULAR ========== */
.urlaub-formular {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.urlaub-formular label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}

.urlaub-formular input,
.urlaub-formular textarea,
.urlaub-formular select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
}

.urlaub-formular button {
  margin-top: 15px;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.urlaub-formular button:hover {
  background-color: #0056b3;
}

/* ========== KALENDER ========== */
.calendar-wrapper {
  width: 320px;
  flex-shrink: 0;
  flex-grow: 0;
  display: flex;
  justify-content: center;
}
</style>