<script setup>
  import { ref } from 'vue';
  import navigation from '@/components/navigation.vue'
  import { users, addUser } from '@/utils/storageTest'

  
  const showForm = ref(false);
  
  const form = ref({
    nachname: '',
    vorname: '',
    email: '',
    password: '',
    isHR: false
  });
  
  function toggleForm() {
    showForm.value = !showForm.value;
  }
  const userList = ref(users)
  function submitForm() {
  
  // Validierung optional
  if (!form.value.nachname || !form.value.vorname || !form.value.email || !form.value.password) {
    alert('Bitte alle Felder ausfüllen!');
    return;
  }

  addUser(
    form.value.nachname,
    form.value.vorname,
    form.value.email,
    form.value.password,
    form.value.isHR
  );

  console.log('Mitarbeiter hinzugefügt:', form.value);

  console.log('addUser wurde ausgeführt');
  // Formular zurücksetzen
  form.value = {
    nachname: '',
    vorname: '',
    email: '',
    password: '',
    isHR: false
  };

  toggleForm(); // Formular schließen
}
  </script>

<template>
    <div>
      <header>
        <h1>Dashboard</h1>
        <navigation></navigation>
        <div class="logo">
          🕒 <span>ETT</span>
        </div>
      </header>
  
      <div class="dashboard-container">
        <div class="card employee-list">
          <div class="section-title">
            <span>Mitarbeiterliste</span>
            <button class="add-btn" @click="toggleForm">{{ showForm ? '×' : '+' }}</button>
          </div>
  
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Vorname</th>
                <th>HR</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
             <tr v-for="user in userList" :key="user.id">
             <td>{{ user.nachname }}</td>
             <td>{{ user.vorname }}</td>
             <td>{{ user.isHR ? 'Ja' : 'Nein' }}</td>
             <td class="actions">✏️ 🗑️</td>
             </tr>
            </tbody>
          </table>
        </div>
  
        <div class="card" style="flex: 2;">
          <div class="section-title">Zeiterfassung</div>
        </div>
  
        <div class="card" style="width: 100%;">
          <div class="section-title">Auswertung</div>
        </div>
      </div>
  
      <!-- FORMULAR-OVERLAY -->
      <div class="overlay" v-if="showForm">
        <div class="form-popup">
          <button class="close-btn" @click="toggleForm">×</button>
          <h2>Neuen Mitarbeiter hinzufügen</h2>
          <input type="text" v-model="form.nachname" placeholder="Name" required>
          <input type="text" v-model="form.vorname" placeholder="Vorname" required>
          <input type="email" v-model="form.email" placeholder="E-Mail" required>
          <input type="password" v-model="form.password" placeholder="Passwort" required>
          
          <label class="checkbox">
            <input type="checkbox" v-model="form.isHR" />
            Gehört zur HR-Abteilung
          </label>
  
          <div class="form-buttons right">
            <button @click="submitForm">Hinzufügen</button>
          </div>
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
    border: 1px solid black;
    border-radius: 1rem;
    padding: 1rem;
    flex: 1;
    min-width: 300px;
  }
  
  .employee-list {
    flex: 0 1 400px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
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
    background: rgba(0,0,0,0.4);
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
    box-shadow: 0 4px 10px rgba(0,0,0,0.25);
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
  </style>