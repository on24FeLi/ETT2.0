<script setup>
import { ref } from 'vue'
import Kalenderansicht from '@/components/kalenderansicht.vue'
import Monatsansichtliste from '@/components/monatsansichtliste.vue'
import navigation from '@/components/navigation.vue';
// Steuerung, welche Ansicht aktiv ist
const currentView = ref('kalender') // 'wochen' oder 'monat'

function showKalender() {
  currentView.value = 'kalender'
}

function showMonatsListe() {
  currentView.value = 'monatsliste'
}
</script>

<template>
    <navigation> </navigation>
  <div class="switcher-container">
    <div class="button-group">
      <button @click="showKalender">kalenderBild</button>
      <button @click="showMonatsListe">ListeBild</button>
    </div>

    <div class="view-container">
      <Kalenderansicht v-if="currentView === 'kalender'" />
      <Monatsansichtliste v-else />
    </div>
  </div>
</template>

<style scoped>
.switcher-container {
  padding: 2rem;
  text-align: center;
}

.button-group {
  margin-bottom: 2rem;
}

button {
  margin: 0 1rem;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #e0e0e0;
}

button:hover {
  background-color: #ccc;
}

.view-container {
  margin-top: 2rem;
}
</style>