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
  <div>
     <header>
      <h1>Monatsansicht</h1>
      <navigation></navigation>
    </header>
    
  <div class="switcher-container">
    <div class="button-group">
  <button :class="{ active: currentView === 'kalender' }" @click="showKalender">
    <img src="/public/kalender.png" alt="Kalender" />
    <span>Kalenderansicht</span>
  </button>
  <button :class="{ active: currentView === 'monatsliste' }" @click="showMonatsListe">
    <img src="/public/liste.png" alt="Liste" />
    <span>Listenansicht</span>
  </button>
  
</div>
    <div class="view-container">
      <Kalenderansicht v-if="currentView === 'kalender'" />
      <Monatsansichtliste v-else />
    </div>
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
.button-group {
  display: inline-flex;        /* Buttons nebeneinander */
  border: 1px solid #ccc;      /* Rahmen um die Gruppe */
  border-radius: 8px;          /* Außen abgerundet */
  overflow: hidden;            /* Rundung auf Buttons anwenden */
}
.button-group button {
  padding: 10px 16px;
  font-size: 1rem;
  cursor: pointer;
  background-color: #f1ecdb;
  border: none;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #888; /* Standard: Grau */
  font-weight: normal;
}

.button-group button.active {
  color: black;
  font-weight: bold;
}

.button-group button:hover {
  background-color: #e0dcca;
}

.button-group button img {
  width: 24px;
  height: 24px;
}


.switcher-container {
  padding: 2rem;
  text-align: center;
  font-weight: bold;
 
}

.view-container {
  margin-top: 2rem;
}
</style>