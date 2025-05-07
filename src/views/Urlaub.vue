<script setup>
import { ref, computed, onMounted } from "vue";
import navigation from '@/components/navigation.vue';
import CleanKalenderansicht from '@/components/CleanKalenderansicht.vue';
import {addUrlaub, deleteUrlaub, getUrlaubeByUser } from '@/utils/Urlaubszeiten';
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const userId = user?.id ?? null;
const urlaubsliste = ref([]);
const startdatum = ref("");
const enddatum = ref("");
const kommentar = ref("");

onMounted(() => {
  if (user && user.id) {
    urlaubsliste.value = getUrlaubeByUser(user.id);
  }
});
console.log(urlaubsliste)
//Urlaub hinzufügen 
function handleSubmit() {
  if (!userId) {
    console.warn("Kein Nutzer angemeldet.");
    return;
  }

  if (startdatum.value && enddatum.value) {
    addUrlaub(userId, startdatum.value, enddatum.value);
    urlaubsliste.value = getUrlaubeByUser(userId); // Liste aktualisieren
    startdatum.value = "";
    enddatum.value = "";
    kommentar.value = "";
  } else {
    console.warn("Start- und Enddatum müssen ausgefüllt sein.");
  }
}
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
      <form class="urlaub-formular"  @submit.prevent="handleSubmit">
        <label for="startdatum">Urlaubsbeginn</label>
        <input type="date" id="startdatum" name="startdatum" v-model="startdatum"  required>

        <label for="enddatum">Urlaubsende</label>
        <input type="date" id="enddatum" name="enddatum"  v-model="enddatum" required>

        <label for="nachricht">Kommentar (optional)</label>
        <textarea id="nachricht" name="nachricht"  v-model="kommentar" rows="4"></textarea>

        <button type="submit">Antrag senden</button>
      </form>
      <!-- Kalender -->
      <div class="calendar-wrapper">
        <CleanKalenderansicht :urlaubsliste="urlaubsliste" />
      </div>
    </div>

    <!-- Urlaubsliste -->
    <div class="urlaubsliste-container">
      <h2>Geplante Urlaube</h2>
      <table v-if="urlaubsliste.length" class="urlaubsliste">
        <thead>
          <tr>
            <th>Startdatum</th>
            <th>Enddatum</th>
            <th>Urlaubstage</th>
            <th>Kommentar</th>
            <th>Urlaub bearbeiten</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(urlaub, index) in urlaubsliste" :key="index">
            <td>{{ new Date(urlaub.start).toLocaleDateString("de-DE") }}</td>
            <td>{{ new Date(urlaub.end).toLocaleDateString("de-DE") }}</td>
            <td>{{ urlaub.tage }}</td>
            <td>{{ urlaub.kommentar }}</td>
            <td><PlatzhalterAktion /></td>
          </tr>
        </tbody>
      </table>
      <p v-else>Keine Urlaube geplant.</p>
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

/* / ========== CONTAINER ========== / */
.urlaub-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 3rem;
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  flex-wrap: nowrap;
}
/* / ========== FORMULAR ========== / */
.urlaub-formular {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(-20px);
  position: relative;
  left: -80px;
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
  background-color: #f1ecdb;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.urlaub-formular button:hover {
  background-color: lightgrey;
}

/* / ========== KALENDER ========== */ 
.calendar-wrapper {
  width: 320px;
  flex-shrink: 0;
  flex-grow: 0;
  display: flex;
  justify-content: center;
} 


/* Urlaubsliste Container */
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
</style>