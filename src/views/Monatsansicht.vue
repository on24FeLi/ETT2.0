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
    <div class="border">
  <div class="switcher-container">
    <div class="button-group">
      <button @click="showKalender"><img src="/public/kalender.png" alt="Kalender" /></button>
      <button @click="showMonatsListe"><img src="/public/liste.png" alt="Liste" /></button>
    </div>

    <div class="view-container">
      <Kalenderansicht v-if="currentView === 'kalender'" />
      <Monatsansichtliste v-else />
    </div>
  </div></div>
</template>

<style scoped>
.border{
  border: 2px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  background-color: #fafafa;

}
.switcher-container {
  padding: 2rem;
  text-align: center;
 
}

.button-group {
  display: inline-flex;        /* Buttons nebeneinander */
  border: 1px solid #ccc;      /* Rahmen um die Gruppe */
  border-radius: 8px;          /* Außen abgerundet */
  overflow: hidden;            /* Rundung auf Buttons anwenden */
  margin-bottom: 2rem;
}

.button-group button {
  margin: 0;                   /* Kein Abstand zwischen Buttons */
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  background-color: #e0e0e0;
  border: none;                /* Keine eigenen Rahmen */
  width: 120px;                /* Buttons etwas länger */
  height: 80px;
  display: flex;               /* Icon schön mittig */
  align-items: center;
  justify-content: center;
}

.button-group button:hover {
  background-color: #ccc;
}

.button-group button img {
  width: 60%;
  height: 60%;
  object-fit: contain;
}

.view-container {
  margin-top: 2rem;
}
</style>