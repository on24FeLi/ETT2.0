<script setup>
import { ref, watch } from 'vue';
import { deleteUrlaub, updateUrlaub } from '@/utils/Urlaubszeiten';

const props = defineProps({
  urlaub: Object
});

const emit = defineEmits(['cancel', 'saved']);

const editedStart = ref("");
const editedEnd = ref("");
const kommentar = ref("");

watch(() => props.urlaub, (newVal) => {
  if (newVal) {
    editedStart.value = newVal.start;
    editedEnd.value = newVal.end;
    kommentar.value = newVal.kommentar || "";
  }
}, { immediate: true });

function handleSave() {
  if (!editedStart.value || !editedEnd.value) {
    console.warn("Start- und Enddatum müssen ausgefüllt sein.");
    return;
  }

  // Beispielhafte Speicherung
  updateUrlaub(props.urlaub.id, editedStart.value, editedEnd.value, kommentar.value);
  emit('saved');
}

function handleDelete() {
  deleteUrlaub(props.urlaub.id);
  emit('saved');
}
</script>

<template>
  <div>
    <h3>Urlaub bearbeiten</h3>

    <label for="editStart">Startdatum</label>
    <input type="date" id="editStart" v-model="editedStart" />

    <label for="editEnd">Enddatum</label>
    <input type="date" id="editEnd" v-model="editedEnd" />

    <label for="kommentar">Kommentar (optional)</label>
    <textarea id="kommentar" rows="3" v-model="kommentar"></textarea>

    <div class="button-group">
      <button class="btn green" @click="handleSave">Speichern</button>
      <button class="btn red" @click="handleDelete">Stornieren</button>
      <button class="btn cancel" @click="$emit('cancel')">Abbrechen</button>
    </div>
  </div>
</template>

<style scoped>
h3 {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-top: 1rem;
  font-weight: bold;
}
input,
textarea {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.button-group {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  color: white;
}
.green {
  background-color: #90AC8F;
}
.red {
  background-color: #9a463d;
}
.cancel {
  background-color: gray;
}
.btn:hover {
  opacity: 0.9;
}
</style>