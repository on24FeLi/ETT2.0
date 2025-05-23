<script setup>
import { ref, onMounted } from "vue";
import navigation from '@/components/navigation.vue';
import CleanKalenderansicht from '@/components/CleanKalenderansicht.vue';
import UrlaubBearbeitenForm from '@/components/UrlaubBearbeitenForm.vue';
import { addUrlaub, getUrlaubeByUser } from '@/utils/Urlaubszeiten';

const user = JSON.parse(localStorage.getItem('loggedInUser'));
const userId = user?.id ?? null;
const urlaubslisteKey = ref(0);
const urlaubsliste = ref([]);
const startdatum = ref("");
const enddatum = ref("");
const kommentar = ref("");
const editingUrlaub = ref(null);
        

onMounted(() => {
  if (userId) {
    urlaubsliste.value = getUrlaubeByUser(userId);
      berechneUrlaubstage();
  }
});

function handleSubmit() {
  if (!userId) {
    console.warn("Kein Nutzer angemeldet.");
    return;
  }

  if (startdatum.value && enddatum.value) {
    addUrlaub(userId, startdatum.value, enddatum.value, kommentar.value);
    urlaubsliste.value = getUrlaubeByUser(userId);
    startdatum.value = "";
    enddatum.value = "";
    kommentar.value = "";
  } else {
    console.warn("Start- und Enddatum müssen ausgefüllt sein.");
  }
}

function handleEdit(urlaub) {
  editingUrlaub.value = { ...urlaub };
}

function clearEdit() {
  editingUrlaub.value = null;
}
const reloadUrlaube = () => {
  urlaubsliste.value = getUrlaubeByUser(userId);
  urlaubslisteKey.value++; // erzwingt Kalender-Update
    berechneUrlaubstage();
};
const JAHRESKONTINGENT = 30;
const genommeneTage = ref(0);
const verbleibendeTage = ref(JAHRESKONTINGENT);

function berechneUrlaubstage() {
  if (!userId) return;

  const alleUrlaube = getUrlaubeByUser(userId);

  const jahr = new Date().getFullYear();
  const urlaubeImJahr = alleUrlaube.filter(u => 
    new Date(u.start).getFullYear() === jahr || new Date(u.end).getFullYear() === jahr
  );

  const tage = urlaubeImJahr.reduce((sum, eintrag) => sum + eintrag.tage, 0);
  genommeneTage.value = tage;
  verbleibendeTage.value = JAHRESKONTINGENT - tage;
}

</script>

<template>
  <div>
    <header>
      <h1>Urlaub</h1>
      <navigation />
    </header><div class="urlaub-container">
      <div class="urlaub-left-column">
<div class="urlaub-info-box">
  <p><strong>Verbleibende Urlaubstage:</strong> {{ verbleibendeTage }}</p>
  <p><strong>Bereits genommene Urlaubstage:</strong> {{ genommeneTage }}</p>
</div>
    
      <form class="urlaub-formular" @submit.prevent="handleSubmit">
        <label for="startdatum">Urlaubsbeginn</label>
        <input type="date" id="startdatum" v-model="startdatum" required>

        <label for="enddatum">Urlaubsende</label>
        <input type="date" id="enddatum" v-model="enddatum" required>

        <label for="nachricht">Kommentar (optional)</label>
        <textarea id="nachricht" v-model="kommentar" rows="4"></textarea>

        <button type="submit">Antrag senden</button>
      </form>
</div>
      <div class="calendar-wrapper">
        <CleanKalenderansicht :urlaubsliste="urlaubsliste" :key="urlaubslisteKey" />
      </div>
    </div>

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
          <tr v-for="urlaub in urlaubsliste" :key="urlaub.id">
            <td>{{ new Date(urlaub.start).toLocaleDateString("de-DE") }}</td>
            <td>{{ new Date(urlaub.end).toLocaleDateString("de-DE") }}</td>
            <td>{{ urlaub.tage }}</td>
            <td>{{ urlaub.kommentar || "–" }}</td>
            <td>
              <button class="edit-btn" @click="handleEdit(urlaub)">
                <img src="/edit.png" alt="Bearbeiten" />
              </button>
            </td>
         

          </tr>
        </tbody>
      </table>
      <p v-else>Keine Urlaube geplant.</p>
    </div>

    <!-- Modal Overlay -->
    <div class="modal-overlay" v-if="editingUrlaub">
      <div class="modal-content">
        <UrlaubBearbeitenForm
  :urlaub="editingUrlaub"
  @cancel="clearEdit"
  @saved="(result) => {
    reloadUrlaube();
    clearEdit();
  }"
/>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ======= HEADER ======= */
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
.urlaub-info-box {
  border-radius: 10px;
  padding: 1rem;
  font-size: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}
/* ======= CONTAINER ======= */
.urlaub-container {
  display: flex;
  align-items: stretch; /* gleiche Höhe */
  gap: 2rem;
  max-width: 852px;
  margin: 2rem auto; 
height: auto;}

.urlaub-left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
/* ======= FORMULAR ======= */
.urlaub-formular {
   background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 100%;
  flex: 1; /* damit es die Höhe auffüllt */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.urlaub-formular, .calendar-wrapper {
  flex: 1;
  box-sizing: border-box;
  
}
.calendar-wrapper {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: center;
  box-sizing: border-box;
}
.urlaub-formular label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}
.urlaub-formular input,
.urlaub-formular textarea {
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


/* ======= LISTE ======= */
.urlaubsliste-container {
  max-width: 852px;
  width: 100%;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}
.urlaubsliste-container h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
.urlaubsliste {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.urlaubsliste th,
.urlaubsliste td {
  padding: 0.75rem 1rem;
  border: 1px solid #e0dccc;
  text-align: left;
}

.urlaubsliste th {
  background-color: #f1ecdb;
  font-weight: 600;
}

.urlaubsliste tr:nth-child(even) {
  background-color: #fdfbf5;
}

.urlaubsliste tr:hover {
  background-color: #f5f0e4;
  transition: background-color 0.2s ease;
}

/* ======= BEARBEITEN BUTTON ======= */
.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
}
.edit-btn img {
  width: 20px;
  height: 20px;
}

/* ======= MODAL OVERLAY ======= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
</style>