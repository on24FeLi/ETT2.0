<script setup>
import { ref, computed } from "vue";
import navigation from "@/components/navigation.vue";
import { users, addUser, deleteUser, updateUser } from "@/utils/storageTest";
import { deleteWorkTimesByUser } from "@/utils/Arbeitszeiten";
import { getWorkTimesByUser } from "@/utils/Arbeitszeiten";

const editingUser = ref(null);
const showForm = ref(false);
const selectedUserForWorkTimes = ref(null);
const workTimesThisMonth = ref([]);
const selectedMonth = ref(new Date().getMonth());
const selectedYear = ref(new Date().getFullYear());


const form = ref({
  nachname: "",
  vorname: "",
  email: "",
  password: "",
  isHR: false,
  arbeitszeitTyp: "Vollzeit",
});

const userList = ref(users);

// Aufteilen in aktiv/archiviert
const activeUsers = computed(() => userList.value.filter(user => !user.isArchived));
const archivedUsers = computed(() => userList.value.filter(user => user.isArchived));

function toggleForm() {
  showForm.value = !showForm.value;
  if (showForm.value) resetForm();
}

function submitForm() {
  if (!form.value.nachname || !form.value.vorname || !form.value.email || !form.value.password) {
    alert("Bitte alle Felder ausfüllen!");
    return;
  }

  const emailExists = users.some(user =>
    user.email.toLowerCase() === form.value.email.toLowerCase() &&
    (!editingUser.value || user.id !== editingUser.value.id)
  );

  if (emailExists) {
    alert("Diese E-Mail-Adresse ist bereits vergeben. Bitte eine andere verwenden.");
    return;
  }

  if (editingUser.value) {
    updateUser(editingUser.value.id, { ...form.value });
  } else {
    addUser(
      form.value.nachname,
      form.value.vorname,
      form.value.email,
      form.value.password,
      form.value.isHR,
      form.value.arbeitszeitTyp
    );
  }

  userList.value = [...users];
  resetForm();
  toggleForm();
}

function archiveUser(user) {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user.id === loggedInUser?.id) {
    alert("Du kannst dich nicht selbst archivieren!");
    return;
  }

  if (confirm(`Möchtest du ${user.vorname} ${user.nachname} wirklich archivieren?`)) {
    updateUser(user.id, { ...user, isArchived: true });
    userList.value = [...users];
  }
}

function restoreUser(user) {
  updateUser(user.id, { ...user, isArchived: false });
  userList.value = [...users];
}

function editUserFromStorage(user) {
  if (user.isArchived) {
    alert("Archivierte Nutzer können nicht bearbeitet werden.");
    return;
  }

  form.value = {
    nachname: user.nachname,
    vorname: user.vorname,
    email: user.email,
    password: user.passwort,
    isHR: user.isHR,
    arbeitszeitTyp: user.arbeitszeitTyp || "Vollzeit",
  };

  editingUser.value = user;
  showForm.value = true;
}

function resetForm() {
  form.value = {
    nachname: "",
    vorname: "",
    email: "",
    password: "",
    isHR: false,
    arbeitszeitTyp: "Vollzeit",
  };
  editingUser.value = null;
}

function deleteUserCompletely(user) {
  if (confirm(`Möchtest du ${user.vorname} ${user.nachname} unwiderruflich löschen?`)) {
    deleteUser(user.id);
    deleteWorkTimesByUser(user.id);
    userList.value = [...users];
  }
}

function selectUser(user) {
  selectedUserForWorkTimes.value = user;
  updateWorkTimes(); // statt direkter Filterung
}


// Hilfsfunktion für Wochentag
function getWeekday(dateString) {
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const d = new Date(dateString);
  return days[d.getDay()];
}

// Summe der Stunden berechnen
const totalHours = computed(() => {
  return workTimesThisMonth.value.reduce((sum, entry) => {
    const hours = parseFloat(entry.workinghours);
    return sum + (isNaN(hours) ? 0 : hours);
  }, 0).toFixed(2);
});
function updateWorkTimes() {
  if (!selectedUserForWorkTimes.value) return;

  const allTimes = getWorkTimesByUser(selectedUserForWorkTimes.value.id);

  workTimesThisMonth.value = allTimes
    .filter(entry => {
      const d = new Date(entry.date);
      return d.getMonth() === selectedMonth.value && d.getFullYear() === selectedYear.value;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}
function goToPreviousMonth() {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11;
    selectedYear.value--;
  } else {
    selectedMonth.value--;
  }
  updateWorkTimes();
}

function goToNextMonth() {
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0;
    selectedYear.value++;
  } else {
    selectedMonth.value++;
  }
  updateWorkTimes();
}

</script>


<template>
    <header>
      <h1>Dashboard</h1>
      <navigation></navigation>
    </header>

    <div class="dashboard-container">

      <!-- Aktive Mitarbeiter -->
      <div class="card employee-list">
        <div class="section-title">
          <span>Aktive Mitarbeiter</span>
          <button class="add-btn" @click="toggleForm">{{ showForm ? "×" : "+" }}</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Vorname</th>
              <th>E-Mail</th>
              <th>Arbeitszeit</th>
              <th>HR</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in activeUsers" :key="user.id">
              <td @click="selectUser(user)" style="cursor: pointer;"> {{ user.nachname }} </td>

              <td>{{ user.vorname }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.arbeitszeitTyp }}</td>
              <td>{{ user.isHR ? "Ja" : "Nein" }}</td>
              <td id="icons">
                <button @click="editUserFromStorage(user)">
                  <img src="/public/edit.png" alt="Edit" />
                </button>
                <button @click="archiveUser(user)">
                  <img src="/public/archive.png" alt="Archivieren" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

<!-- Zeiterfassung -->
<div class="card" style="flex: 2">
  <div class="Zeiterfassung">Zeiterfassung</div>

  <div v-if="selectedUserForWorkTimes">
    <p><strong>{{ selectedUserForWorkTimes.vorname }} {{ selectedUserForWorkTimes.nachname }}</strong></p>
    <p>Geleistete Stunden im {{ new Date().toLocaleString('de-DE', { month: 'long' }) }}: {{ totalHours }} Stunden</p>
    <div class="zeiterfassung-month-controls">
  <button @click="goToPreviousMonth" class="zeiterfassung-month-button">←</button>
  <span class="zeiterfassung-month">
    {{ new Date(selectedYear, selectedMonth).toLocaleString('de-DE', { month: 'long', year: 'numeric' }) }}
  </span>
  <button @click="goToNextMonth" class="zeiterfassung-month-button">→</button>
</div>



    <table v-if="workTimesThisMonth.length">
      <thead>
        <tr>
          <th>Tag</th>
          <th>Datum</th>
          <th>Beginn</th>
          <th>Ende</th>
          <th>Arbeitszeit</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in workTimesThisMonth" :key="index">
          <td>{{ getWeekday(entry.date) }}</td>
          <td>{{ new Date(entry.date).toLocaleDateString() }}</td>
          <td>{{ entry.start }}</td>
          <td>{{ entry.end }}</td>
          <td>{{ Number(entry.workinghours).toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else>
    <p>Bitte einen Mitarbeiter auswählen.</p>
  </div>
</div>

      </div>

<div class="bottom-container">
  <!-- Archivierte Mitarbeiter -->
  <div class="card employee-list archived-list">
    <div class="section-title">
      <span>Archivierte Mitarbeiter</span>
    </div>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Vorname</th>
          <th>E-Mail</th>
          <th>Arbeitszeit</th>
          <th>HR</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in archivedUsers" :key="user.id">
          <td>{{ user.nachname }}</td>
          <td>{{ user.vorname }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.arbeitszeitTyp }}</td>
          <td>{{ user.isHR ? "Ja" : "Nein" }}</td>
          <td id="icons">
            <button @click="restoreUser(user)">
              <img src="/public/unarchive.png" alt="Wiederherstellen" />
            </button>
            <button @click="deleteUserCompletely(user)">
              <img src="/public/delete.png" alt="Löschen" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Urlaub -->
  <div class="card urlaub-box">
    <div class="Urlaub">Urlaub</div>
  </div>
</div>

    <!-- FORMULAR-OVERLAY -->
    <div class="overlay" v-if="showForm">
      <div class="form-popup">
        <button class="close-btn" @click="toggleForm">×</button>
        <h2>{{ editingUser ? "Mitarbeiter bearbeiten" : "Neuen Mitarbeiter hinzufügen" }}</h2>
        <input type="text" v-model="form.nachname" placeholder="Name" required />
        <input type="text" v-model="form.vorname" placeholder="Vorname" required />
        <input type="email" v-model="form.email" placeholder="E-Mail" required />
        <input type="password" v-model="form.password" placeholder="Passwort" required />

        <label class="checkbox">
          <input type="checkbox" v-model="form.isHR" />
          Gehört zur HR-Abteilung
        </label>

        <label class="checkbox">
          Arbeitszeit:
          <select v-model="form.arbeitszeitTyp">
            <option value="Vollzeit">Vollzeit</option>
            <option value="Teilzeit">Teilzeit</option>
          </select>
        </label>

        <div class="form-buttons right">
          <button @click="submitForm">{{ editingUser ? "Speichern" : "Hinzufügen" }}</button>
        </div>
      </div>
    </div>
</template>

<style scoped>
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
  background-color: #fff;
}

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

.dashboard-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 2rem;
}

.card {
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.employee-list {
  flex: 0 1 400px;
}
.archived-list {
 padding-left: 12px;
 margin-left: 30px;
 padding-right: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid black;
  padding: 0.5rem;
  text-align: left;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.add-btn {
  font-size: 1.5rem;
  margin-left: 1rem;
  cursor: pointer;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* FORM OVERLAY */

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-popup {
  position: relative;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 300px;
}

.form-popup input[type="text"],
.form-popup input[type="email"],
.form-popup input[type="password"] {
  padding: 0.6rem;
  border-radius: 0.3rem;
  border: 1px solid #ccc;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.form-buttons.right {
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
}

#icons img {
  width: 25px;
  height: 25px;
  padding-left: 7px;
}

#icons button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

#icons {
  background-color: lightgrey;
  justify-content: center;
  align-items: center;
  padding: 5px;
  gap: 15px; /* Abstand zwischen den Icons */
}

.edit {
  border-right: 0;
}
/* ZEITERFASSUNG: angepasstes Styling für bestehenden HTML-Code */

.Zeiterfassung {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.card .Zeiterfassung + div p {
  font-size: 1.1rem;
  margin: 0.3rem 0;
  color: #444;
}

.card .Zeiterfassung + div table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.card .Zeiterfassung + div table th,
.card .Zeiterfassung + div table td {
  padding: 0.75rem 1rem;
  border: 1px solid #e0dccc;
  text-align: left;
}

.card .Zeiterfassung + div table th {
  background-color: #f1ecdb;
  font-weight: 600;
}

.card .Zeiterfassung + div table tr:nth-child(even) {
  background-color: #fdfbf5;
}

.card .Zeiterfassung + div table tr:hover {
  background-color: #f5f0e4;
  transition: background-color 0.2s ease;
}
/* Monatsschaltung & Anzeige */
.zeiterfassung-month-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.zeiterfassung-month {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
}

.zeiterfassung-month-button {
  background-color: #f1ecdb;
  border: 1px solid #d8d2be;
  padding: 0.3rem 0.7rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zeiterfassung-month-button:hover {
  background-color: #e9e2cf;
  transform: scale(1.05);
}
.bottom-container {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}
.urlaub-box {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-right: 30px;
}

.urlaub-box .Urlaub {
  color: #333;
}
</style>
