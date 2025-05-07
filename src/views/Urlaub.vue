<script setup>
import { ref, computed, onMounted } from "vue";
import navigation from '@/components/navigation.vue';
import CleanKalenderansicht from '@/components/CleanKalenderansicht.vue';
import {urlaube} from '@/utils/Urlaubszeiten';

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
     </div>
<CleanKalenderansicht/>
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

.urlaubsliste-container {
  max-width: 900px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
}

.urlaubsliste-container h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.urlaubsliste {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.urlaubsliste th,
.urlaubsliste td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.urlaubsliste th {
  background-color: #f3e9d2;
  font-weight: bold;
}

.urlaubsliste tr:nth-child(even) {
  background-color: #f9f9f9;
}

.urlaubsliste tr:hover {
  background-color: #f0f0f0;
}

.aktion-btn {
  padding: 0.5rem 1rem;
  background-color: #dedede;
  border: none;
  border-radius: 6px;
  cursor: pointer;
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