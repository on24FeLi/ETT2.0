<script setup>
import { ref, onMounted } from 'vue'

const showDashboard = ref(false)

onMounted(() => {
  const userData = localStorage.getItem('loggedInUser')
  if (userData) {
    const user = JSON.parse(userData)
    showDashboard.value = user.isHR === true
  }
})
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "/Login"; 
}
</script>
<template>
<header class="header">
        <nav class="nav-bar">
          <a href="Tagesanzeige">Tagesanzeige</a>
          <div class="dropdown">
  <button class="dropbtn">Ansichten <span class="chevron"></span></button>
  <div class="dropdown-content">
    <a href="Wochenansicht">Wochenansicht</a>
    <a href="Monatsansicht">Monatsansicht</a>
    <a href="Jahresansicht">Jahresansicht</a>
  </div>
</div>
<a href="Urlaub">Urlaub</a>
          <a v-if="showDashboard" href="Dashboard">Dashboard</a>
          <button @click="logout" id="logout">Logout 
            <img src="/public/rechter-pfeil.png" alt="Logout"/>
          </button>
        </nav>
      </header>
      <img src="/LOGO_ETT.png" alt="Easy Time Tracker Logo" class="logo" />
</template>
<style>
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F2EDDB;
}

.header {
  background-color: #F2EDDB;
  padding: 20px;
  border-bottom: 1px solid lightgrey;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-container {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-bar {
  display: flex;
  gap: 30px;
  align-items: center;
}

.nav-bar a,
.nav-bar #logout {
  text-decoration: none;
  font-weight: bold;
  color: black;
  font-family: Georgia, serif;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  background-color: #F2EDDB;
  border: none;
  cursor: pointer;
}

.nav-bar a:hover,
.nav-bar #logout:hover {
  background-color: #ddd;
}

.logo {
  height: 80px;
  width: auto;
}

img {
  height: 10px;
  width: 10px;
}
.logo{
  height: 150px;
  width: 150px;
}
.dropdown {
  position: relative;
  display: inline-block;
}

.dropbtn {
  font-weight: bold;
  color: black;
  font-family: Georgia, serif;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #F2EDDB;
  border: none;
  cursor: pointer;
}

.dropbtn:hover {
  background-color: #ddd;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: white;
  min-width: 160px;
  box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
  z-index: 1;
  flex-direction: column;
}

.dropdown-content a {
  color: black;
  padding: 8px 12px;
  text-decoration: none;
  display: block;
  background-color: white;
}

.dropdown-content a:hover {
  background-color: #ddd;
}

.dropdown:hover .dropdown-content {
  display: flex;
}
.chevron {
  display: inline-block;
  margin-left: 5px;
  width: 8px;
  height: 8px;
  border-right: 2px solid black;
  border-bottom: 2px solid black;
  transform: rotate(45deg);
  transition: transform 0.3s ease;
}

.dropdown:hover .chevron {
  transform: rotate(-135deg);
}

</style>