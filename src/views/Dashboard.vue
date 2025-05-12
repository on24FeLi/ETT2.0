<script setup>
import { ref, computed } from "vue";
import navigation from "@/components/navigation.vue";
import { users, addUser, deleteUser, updateUser } from "@/utils/storageTest";
import { deleteWorkTimesByUser } from "@/utils/Arbeitszeiten";
import { getWorkTimesByUser } from "@/utils/Arbeitszeiten";
import { getUrlaubeByUser } from "@/utils/Urlaubszeiten";

const editingUser = ref(null);
const showForm = ref(false);
const selectedUserForWorkTimes = ref(null);
const workTimesThisMonth = ref([]);
const selectedMonth = ref(new Date().getMonth());
const selectedYear = ref(new Date().getFullYear());
const urlaubeForSelectedUser = ref([]);

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
  updateWorkTimes();
  updateUrlaube(); // HIER ergänzt
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
function updateUrlaube() {
  if (!selectedUserForWorkTimes.value) return;
  urlaubeForSelectedUser.value = getUrlaubeByUser(selectedUserForWorkTimes.value.id);
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
    <!-- LINKE SPALTE -->
    <div class="left-column">
      <!-- Aktive Mitarbeiter -->
<div class="card employee-list">
  <div class="section-title">
    <span>Aktive Mitarbeiter</span>
    <button class="add-btn" @click="toggleForm">{{ showForm ? "×" : "+" }}</button>
  </div>

  <div class="employee-table-wrapper">
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
          <td @click="selectUser(user)" style="cursor: pointer;">{{ user.nachname }}</td>
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
</div>

<!-- Archivierte Mitarbeiter -->
<div class="card employee-list archived-list">
  <div class="section-title">
    <span>Archivierte Mitarbeiter</span>
  </div>

  <div class="employee-table-wrapper">
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
</div>
</div>

    <!-- RECHTE SPALTE -->
    <div class="right-column">
   <!-- Zeiterfassung -->
<div class="card zeiterfassung-box">
  <div class="Zeiterfassung">Zeiterfassung</div>

  <div v-if="selectedUserForWorkTimes">
    <p>Name: <strong>{{ selectedUserForWorkTimes.vorname }} {{ selectedUserForWorkTimes.nachname }}</strong></p>
    <p>Geleistete Stunden im {{ new Date().toLocaleString('de-DE', { month: 'long' }) }}: {{ totalHours }} Stunden</p>

    <div class="zeiterfassung-month-controls">
      <button @click="goToPreviousMonth" class="zeiterfassung-month-button">←</button>
      <span class="zeiterfassung-month">
        {{ new Date(selectedYear, selectedMonth).toLocaleString('de-DE', { month: 'long', year: 'numeric' }) }}
      </span>
      <button @click="goToNextMonth" class="zeiterfassung-month-button">→</button>
    </div>

   <!-- Fixierter Tabellenkopf -->
<table class="worktime-table-header" v-if="workTimesThisMonth.length">
  <thead>
    <tr>
      <th>Tag</th>
      <th>Datum</th>
      <th>Beginn</th>
      <th>Ende</th>
      <th>Arbeitszeit</th>
    </tr>
  </thead>
</table>

<!-- Scrollbarer Tabellenkörper -->
<div class="worktime-table-wrapper" v-if="workTimesThisMonth.length">
  <table class="worktime-table-body">
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

  </div>
  <div v-else>
    <p>Bitte einen Mitarbeiter auswählen.</p>
  </div>
</div>
      <!-- Urlaub -->
      <div class="card urlaub-box">
        <div class="Urlaub">Urlaub</div>

        <div v-if="selectedUserForWorkTimes">

          <table v-if="urlaubeForSelectedUser.length">
            <thead>
              <tr>
                <th>Von</th>
                <th>Bis</th>
                <th>Tage</th>
                <th>Kommentar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="urlaub in urlaubeForSelectedUser" :key="urlaub.id">
                <td>{{ new Date(urlaub.start).toLocaleDateString() }}</td>
                <td>{{ new Date(urlaub.end).toLocaleDateString() }}</td>
                <td>{{ urlaub.tage }}</td>
                <td>{{ urlaub.kommentar }}</td>
              </tr>
            </tbody>
          </table>

          <p v-else>Kein Urlaub gebucht.</p>
        </div>
        <div v-else>
          <p>Bitte einen Mitarbeiter auswählen.</p>
        </div>
      </div>
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
  overflow-x: hidden; /* verhindert horizontales Scrollen */
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

/* Layoutstruktur */
.dashboard-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 2rem;
  overflow-x: hidden; /* verhindert horizontales Scrollen */
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  }

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-left: 1rem;
}

.card {
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  max-width: 100%;
  overflow-x: hidden; /* verhindert horizontales Scrollen */
}

/* Tabellen */
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

.section-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-btn {
  font-size: 1.5rem;
  margin-left: 1rem;
  cursor: pointer;
}

/* Aktionen / Icons */
#icons {
  background-color: #f1ecdb;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  gap: 15px;
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

/* Formular-Popup */
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

/* Zeiterfassung */
.Zeiterfassung {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.card .Zeiterfassung + div p {
  font-size: 18px;
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

/* Monatsschaltung */
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

/* Urlaub */
.urlaub-box {
  font-size: 1.5rem;
  color: #333;
}

.urlaub-box .Urlaub {
  color: #333;
}

.urlaub-box table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-top: 1rem;
}

.urlaub-box table th,
.urlaub-box table td {
  padding: 0.75rem 1rem;
  border: 1px solid #e0dccc;
  text-align: left;
}

.urlaub-box table th {
  background-color: #f1ecdb;
  font-weight: 600;
}

.urlaub-box table tr:nth-child(even) {
  background-color: #fdfbf5;
}

.urlaub-box table tr:hover {
  background-color: #f5f0e4;
  transition: background-color 0.2s ease;
}

/* Worktime Tabelle */
.worktime-table-wrapper {
  max-height: 300px;
  overflow-y: auto;
}

.worktime-table-wrapper table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.worktime-table-wrapper thead {
  position: sticky;
  top: 0;
  background-color: #f1ecdb;
  z-index: 1;
}

.worktime-table-wrapper tr:nth-child(even) {
  background-color: #fdfbf5;
}

.worktime-table-wrapper tr:hover {
  background-color: #f5f0e4;
  transition: background-color 0.2s ease;
}

.worktime-table-wrapper th,
.worktime-table-wrapper td {
  padding: 0.75rem 1rem;
  border: 1px solid #e0dccc;
  text-align: left;
}

/* Mitarbeiter Tabellen */
.employee-table-wrapper {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e0dccc; /* äußere Umrandung */
  border-radius: 0.5rem;
}

.employee-table-wrapper table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: #fff;
}

.employee-table-wrapper thead {
  position: sticky;
  top: 0;
  background-color: #f1ecdb;
  z-index: 1;
}

.employee-table-wrapper th,
.employee-table-wrapper td {
  padding: 0.75rem 1rem;
  border: 1px solid #e0dccc;
  text-align: left;
  font-weight: 400;
}

/* Fette Schrift im Header */
.employee-table-wrapper th {
  font-weight: 600;
}

/* Zeilenfarben */
.employee-table-wrapper tr:nth-child(even) {
  background-color: #fdfbf5;
}

.employee-table-wrapper tr:hover {
  background-color: #f5f0e4;
  transition: background-color 0.2s ease;
}

/* NUR Email-Spalte nicht umbrechen + abschneiden */
.employee-table-wrapper td:nth-child(3),
.employee-table-wrapper th:nth-child(3) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

</style>
