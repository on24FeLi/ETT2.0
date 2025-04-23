export default {
    name: 'TimeTracker',
    template: `
      <div class="p-4 border rounded shadow-md max-w-md mx-auto">
        <h2 class="text-xl font-bold mb-4">🕒 Zeiterfassung</h2>
        
        <div class="mb-4">
          <label class="block text-sm font-medium">Benutzername:</label>
          <input v-model="trackingData.username" class="border px-2 py-1 w-full" />
        </div>
  
        <div class="mb-4">
          <button @click="startTracking" :disabled="currentStart" class="bg-green-500 text-white px-4 py-2 mr-2 rounded">
            Start
          </button>
          <button @click="stopTracking" :disabled="!currentStart" class="bg-red-500 text-white px-4 py-2 rounded">
            Stopp
          </button>
        </div>
  
        <div v-if="trackingData.times.length">
          <h3 class="font-semibold mb-2">Erfasste Zeiten:</h3>
          <ul class="text-sm space-y-1">
            <li v-for="(entry, index) in trackingData.times" :key="index">
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
        trackingData: {
          username: '',
          times: []
        },
        currentStart: null
      };
    },
    mounted() {
      const saved = localStorage.getItem('timeTrackingData');
      if (saved) {
        this.trackingData = JSON.parse(saved);
      }
    },
    watch: {
      trackingData: {
        handler(newVal) {
          localStorage.setItem('timeTrackingData', JSON.stringify(newVal));
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
          this.trackingData.times.push({
            start: this.currentStart,
            end: end
          });
          this.currentStart = null;
        }
      },
      clearData() {
        localStorage.removeItem('timeTrackingData');
        this.trackingData = {
          username: '',
          times: []
        };
        this.currentStart = null;
      },
      formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString();
      }
    }
  };
  

