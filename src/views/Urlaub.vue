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

    <!-- Kalenderansicht -->
    <CleanKalenderansicht/>

    <!-- Urlaubsliste -->
    <div class="urlaubsliste-container">
      <h2>Geplante Urlaube</h2>
      <table v-if="urlaube.length" class="urlaubsliste">
        <thead>
          <tr>
            <th>Startdatum</th>
            <th>Enddatum</th>
            <th>Urlaubstage</th>
            <th>Urlaub bearbeiten</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(urlaub, index) in urlaube" :key="index">
            <td>{{ new Date(urlaub.start).toLocaleDateString("de-DE") }}</td>
            <td>{{ new Date(urlaub.end).toLocaleDateString("de-DE") }}</td>
            <td>{{ urlaub.tage }}</td>
            <td><PlatzhalterAktion /></td>
          </tr>
        </tbody>
      </table>
      <p v-else>Keine Urlaube geplant.</p>
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
</style>