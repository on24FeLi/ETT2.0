<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  setTimeout(() => {
    window.location.href = '/login' // oder: router.push('/login')
  }, 3000)
})
</script>

<template>
  <div class="splash-container">
    <img src="/ETT_Startseite.png" alt="Easy Time Tracker Splashscreen" class="splash-image" />
  </div>
</template>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #F2EDDB;
}

.splash-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.splash-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>