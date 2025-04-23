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

</script>
<template>
<header class="header">
        <nav class="nav-bar">
          <a href="Tagesanzeige">Tagesanzeige</a>
          <a href="#">Übersicht</a>
          <a v-if="showDashboard" href="Dashboard">Dashboard</a>
        </nav>
      </header>
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
    border-bottom: 1px solid black;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .nav-bar {
    display: flex;
    gap: 30px;
  }
  
  .nav-bar a {
    text-decoration: none;
    font-weight: bold;
    color: black;
    font-family: Georgia, serif;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background-color 0.3s ease;
  }
  
  .nav-bar a:hover {
    background-color: #ddd;
  }
</style>