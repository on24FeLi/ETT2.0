export default {
  name: 'TimeTracker',
  template: `
    <div class="p-4 border rounded shadow-md max-w-md mx-auto">
      <h2 class="text-xl font-bold mb-4">🕒 Zeiterfassung</h2>

      <div class="mb-4">
        <label class="block text-sm font-medium">Benutzer auswählen:</label>
        <select v-model="selectedUser" class="border px-2 py-1 w-full">
          <option v-for="(user, name) in allUsers" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <button @click="startTracking" :disabled="currentStart" class="bg-green-500 text-white px-4 py-2 mr-2 rounded">
          Start
        </button>
        <button @click="stopTracking" :disabled="!currentStart" class="bg-red-500 text-white px-4 py-2 rounded">
          Stopp
        </button>
      </div>

      <div v-if="currentUser.times.length">
        <h3 class="font-semibold mb-2">Erfasste Zeiten für {{ selectedUser }}:</h3>
        <ul class="text-sm space-y-1">
          <li v-for="(entry, index) in currentUser.times" :key="index">
            ▶️ {{ formatDate(entry.start) }} - ⏹️ {{ formatDate(entry.end) }}
          </li>
        </ul>
      </div>

      <button @click="clearData" class="mt-4 text-xs text-gray-500 underline">
        Daten zurücksetzen
      </button>
    </div>
  `,
  data() {
    return {
      allUsers: {},
      selectedUser: 'Max Mustermann',
      currentStart: null
    };
  },
  computed: {
    currentUser() {
      return this.allUsers[this.selectedUser] || { times: [] };
    }
  },
  mounted() {
    const saved = localStorage.getItem('multiUserTimeTracking');
    if (saved) {
      this.allUsers = JSON.parse(saved);
    } else {
      // Initiale Demo-Daten
      this.allUsers = {
        'Max Mustermann': {
          times: [
            { start: '2025-04-22T08:00:00', end: '2025-04-22T12:00:00' },
            { start: '2025-04-22T13:00:00', end: '2025-04-22T17:00:00' }
          ]
        },
        'Erika Beispiel': {
          times: [
            { start: '2025-04-21T09:30:00', end: '2025-04-21T12:30:00' },
            { start: '2025-04-21T13:15:00', end: '2025-04-21T16:00:00' }
          ]
        }
      };
      localStorage.setItem('multiUserTimeTracking', JSON.stringify(this.allUsers));
    }
  },
  watch: {
    allUsers: {
      handler(newVal) {
        localStorage.setItem('multiUserTimeTracking', JSON.stringify(newVal));
      },
      deep: true
    }
  },
  methods: {
    startTracking() {
      this.currentStart = new Date().toISOString();
    },
    stopTracking() {
      if (this.currentStart) {
        const end = new Date().toISOString();
        this.currentUser.times.push({
          start: this.currentStart,
          end: end
        });
        this.currentStart = null;
      }
    },
    clearData() {
      localStorage.removeItem('multiUserTimeTracking');
      this.allUsers = {};
      this.selectedUser = '';
      this.currentStart = null;
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString();
    }
  }
};
