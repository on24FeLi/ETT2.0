
<template>
  <div class="day-editor">
    <button @click="isCalendarOpen = true" class="open-button">Arbeitszeiten bearbeiten</button>

    <!-- Kalender Popup -->
    <div v-if="isCalendarOpen" class="modal-overlay" @click.self="isCalendarOpen = false">
      <div class="calendar-modal">
        <button class="close-button" @click="isCalendarOpen = false">×</button>
        <div class="calendar-header">
          <img src="/rechter-pfeil.png" @click="prevMonth" class="arrow left-arrow" />
          <h2>{{ currentMonthYear }}</h2>
          <img src="/rechter-pfeil.png" @click="nextMonth" class="arrow right-arrow" />
        </div>
        <div class="calendar-grid">
          <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>
          <div
            v-for="blank in firstDayOfMonth"
            :key="'blank-' + blank"
            class="day blank"
          ></div>
          <div
            v-for="day in daysInMonth"
            :key="'day-' + day"
            class="day"
            @click="openTimeForm(day)"
          >
            {{ day }}
          </div>
        </div>
      </div>
    </div>

    <!-- Uhrzeit-Eingabe Popup -->
    <div v-if="isTimeFormOpen" class="modal-overlay" @click.self="isTimeFormOpen = false">
      <div class="time-form-modal">
        <button class="close-button" @click="isTimeFormOpen = false">×</button>
        <h3>Arbeitszeit am {{ selectedDateString }}</h3>

        <div class="time-input-group">
          <label>Start:</label>
          <input v-model="startTime" type="time" />
          <span>Uhr</span>
        </div>

        <div class="time-input-group" style="margin-top: 1rem;">
          <label>Stop:</label>
          <input v-model="stopTime" type="time" />
          <span>Uhr</span>
        </div>

        <div class="time-input-group" style="margin-top: 1rem;">
          <label>Gearbeitete Stunden:</label>
          <input v-model="workedTime" type="text" placeholder="z. B. 07:30" />
          <span>h</span>
        </div>

        <button class="save-button" @click="saveTime">Speichern</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { addOrUpdateWorkTime } from '@/utils/Arbeitszeiten';

const user = JSON.parse(localStorage.getItem('loggedInUser'));
const userId = user?.id ?? null;

const isCalendarOpen = ref(false);
const isTimeFormOpen = ref(false);
const selectedDate = ref(null);
const startTime = ref('');
const stopTime = ref('');
const workedTime = ref('');

const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth());

const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const firstDayOfMonth = computed(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1).getDay();
  return first === 0 ? 6 : first - 1; // Wochenstart Montag
});

const currentMonthYear = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });
});

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const openTimeForm = (day) => {
  const date = new Date(currentYear.value, currentMonth.value, day);
  date.setHours(12, 0, 0, 0);
  selectedDate.value = date;

  const formattedDate = date.toISOString().split('T')[0];
  const allEntries = JSON.parse(localStorage.getItem('workTimes')) || [];
  const entry = allEntries.find(
    (e) => e.userId === userId && e.date === formattedDate
  );

  if (entry) {
    startTime.value = entry.start;
    stopTime.value = entry.end;
    workedTime.value = entry.workinghours;
  } else {
    startTime.value = '';
    stopTime.value = '';
    workedTime.value = '';
  }

  isTimeFormOpen.value = true;
  isCalendarOpen.value = false;
};

const selectedDateString = computed(() =>
  selectedDate.value
    ? selectedDate.value.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''
);

const emit = defineEmits(['workTimeSaved']);
const saveTime = () => {
  if (!selectedDate.value || !startTime.value || !stopTime.value || !workedTime.value) {
    alert("Bitte alle Felder ausfüllen.");
    return;
  }

  if (!userId) {
    alert("Kein eingeloggter Benutzer gefunden.");
    return;
  }

  const formattedDate = selectedDate.value.toISOString().split('T')[0];
  addOrUpdateWorkTime(userId, formattedDate, workedTime.value, startTime.value, stopTime.value);

  console.log(`Gespeichert für ${formattedDate}`);
  isTimeFormOpen.value = false;

  startTime.value = '';
  stopTime.value = '';
  workedTime.value = '';
  emit('workTimeSaved');
};
</script>

<style scoped>
.day-editor {
  text-align: center;
  margin-top: 2rem;
}

.open-button {
  padding: 0.6rem 1.2rem;
  background-color: #90AC8F;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.calendar-modal,
.time-form-modal {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  position: relative;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  color: #888;
}

.close-button:hover {
  color: #333;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.arrow {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.left-arrow {
  transform: rotate(180deg);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-name {
  font-weight: bold;
  text-align: center;
}

.day {
  padding: 0.8rem;
  background-color: #f1f1f1;
  text-align: center;
  cursor: pointer;
  border-radius: 0.4rem;
}

.day:hover {
  background-color: #90AC8F;
  color: white;
}

.blank {
  background-color: transparent;
}

.time-input-group {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.save-button {
  margin-top: 1.5rem;
  padding: 0.6rem 1.2rem;
  background-color: #90AC8F;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
}
</style>