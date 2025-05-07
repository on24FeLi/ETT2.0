<script setup>
import { ref, computed } from "vue";
import navigation from '@/components/navigation.vue';
import CleanKalenderansicht from '@/components/CleanKalenderansicht.vue'
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
form {
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      max-width: 400px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    label {
      display: block;
      margin-top: 10px;
      font-weight: bold;
    }
    input, textarea, select {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      box-sizing: border-box;
    }
    button {
      margin-top: 15px;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
    .urlaub-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 3rem; /* Abstand zwischen Formular und Kalender */
  padding: 2rem;
}

.urlaub-formular {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px; /* Fixe Breite, damit es nicht zu breit wird */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.calendar-wrapper {
  flex-shrink: 0; /* Verhindert, dass sich der Kalender beim Platzmangel verkleinert */
}

</style>