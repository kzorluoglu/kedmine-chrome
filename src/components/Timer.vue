<script>
import { EventBus } from "../eventBus";

export default {
  name: 'Timer',
  props: {
    issue: 'Object'
  },
  data() {
    return {
      issueComment: '',
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      lastUpdate: null,
      showDescription: false,
    };
  },
  computed: {
    usedTime() {
      if (this.isRunning) {
        const now = new Date().getTime();
        const timeSinceLastUpdate = this.lastUpdate ? now - this.lastUpdate : 0;
        return this.elapsedTime + timeSinceLastUpdate;
      }
      return this.elapsedTime;
    },
  },
  methods: {
    toggleTimer() {
      if (this.isRunning) {
        clearInterval(this.interval);
      } else {
        // Emit the 'timer-started' event before starting the timer
        EventBus.emit('timer-started', this.issue.id);

        this.lastUpdate = new Date().getTime();
        this.interval = setInterval(this.updateTimer, 1000);
      }
      this.isRunning = !this.isRunning;
      this.saveStateToLocalStorage();
    },
    pauseTimer() {
      if (this.isRunning) {
        clearInterval(this.interval);
        this.isRunning = false;
        this.saveStateToLocalStorage();
      }
    },
    updateTimer() {
      const now = new Date().getTime();
      const timeSinceLastUpdate = this.lastUpdate ? now - this.lastUpdate : 0;
      this.elapsedTime += timeSinceLastUpdate;
      this.lastUpdate = now;
    },
    saveStateToLocalStorage() {
      const timerState = {
        startTime: this.startTime,
        elapsedTime: this.elapsedTime,
        lastUpdate: this.lastUpdate,
        isRunning: this.isRunning,
      };
      localStorage.setItem('timerState_' + this.issue.id, JSON.stringify(timerState));
    },
    loadStateFromLocalStorage() {
      const savedState = localStorage.getItem('timerState_' + this.issue.id);
      if (savedState) {
        const timerState = JSON.parse(savedState);
        this.startTime = timerState.startTime;
        this.elapsedTime = timerState.elapsedTime;
        this.lastUpdate = timerState.lastUpdate;
        this.isRunning = timerState.isRunning;
        if (this.isRunning) {
          this.interval = setInterval(this.updateTimer, 1000);
        }
      }
    },
    formatTime(milliseconds) {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    },
    pad(value) {
      return value.toString().padStart(2, '0');
    },
  },
  created() {
    this.loadStateFromLocalStorage();
    EventBus.on('timer-started', (issueNumber) => {
      if (issueNumber !== this.issue.id) {
        this.pauseTimer();
      }
    });
  },
  beforeDestroy() {
    clearInterval(this.interval);
    this.saveStateToLocalStorage();

    // Cleanup to avoid potential memory leaks
    EventBus.off('timer-started');
  },
};
</script>

<template>
  <div class="card" @click="showDescription = !showDescription">
    <div class="card-body">
      <div class="grid-container">
        <div class="subject-cell">
          <span class="label">Issue #{{ issue.id }} - {{ issue.subject }}</span>
        </div>
        <div class="button-cell">
          <button class="toggle-button" @click.stop="toggleTimer">{{ isRunning ? 'Pause' : 'Play' }}</button>
        </div>
        <div class="comment-cell">
          <input class="comment-input" v-model="issueComment" placeholder="Add a comment..." />
        </div>
      </div>
      <div v-if="showDescription" class="description">
        {{ issue.description }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid rgba(0,0,0,.125);
  border-radius: .25rem;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,.1);
  overflow: hidden;
  margin-bottom: 1rem;
  padding: 10px;
}

.card-body {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: 75% 25%;
  grid-template-rows: auto auto;
  gap: 10px;
  align-items: center;
}

.subject-cell {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.button-cell {
  grid-row: 1 / 3; /* Span across two rows to center it vertically between the subject and comment */
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-cell {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}

.comment-input {
  width: 100%;
  padding: 5px;
  border: 1px solid rgba(0,0,0,.125);
  border-radius: .25rem;
  transition: box-shadow .15s ease-in-out;
}

.comment-input:focus {
  box-shadow: 0 0 0 .2rem rgba(0,123,255,.25);
  outline: 0;
}

.label {
  font-weight: bold;
}

.toggle-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: .25rem;
  transition: background-color .15s ease-in-out;
}

.toggle-button:hover {
  background-color: #0056b3;
}

</style>
