<script>
import { EventBus } from "../eventBus";
import { Close, Play, Pause, Stop, SendClock } from "mdue"
 export default {
  name: 'Timer',
  components: {
    Close, Play, Pause, Stop, SendClock
  },
  props: {
    uniqueTimerId: null,
    id: null,
    title: null,
    description: null,
    url: null,
  },
  data() {
    return {
      localId: this.id,
      localTitle: this.title,
      localDescription: this.description,
      localUrl: this.url,
      issueComment: '',
      isRunning: false,
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
        EventBus.emit('timer-started', this.uniqueTimerId);

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
        uniqueTimerId: this.uniqueTimerId,
        id: this.localId,
        title: this.localTitle,
        description: this.localDescription,
        url: this.localUrl,
        elapsedTime: this.elapsedTime,
        lastUpdate: this.lastUpdate,
        isRunning: this.isRunning,
        issueComment: this.issueComment,
        usedTime: this.usedTime,
      };
      localStorage.setItem('timerState_' + this.id, JSON.stringify(timerState));
    },
    loadStateFromLocalStorage() {
      const savedState = localStorage.getItem('timerState_' + this.id);
      if (savedState) {
        const timerState = JSON.parse(savedState);

        this.localId = timerState.id;
        this.localTitle = timerState.title;
        this.localDescription = timerState.description;
        this.localUrl = timerState.url;

        this.elapsedTime = timerState.elapsedTime;
        this.lastUpdate = timerState.lastUpdate;
        this.isRunning = timerState.isRunning;
        this.issueComment = timerState.issueComment;

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
    stopTimerAndClear() {
      // Stop the timer
      if (this.isRunning) {
        clearInterval(this.interval);
        this.isRunning = false;
      }

      // Clear the elapsed time
      this.elapsedTime = 0;

      // Clear the last update time
      this.lastUpdate = null;

      // Clear the issue comment
      this.issueComment = '';

      // Save the updated state to localStorage
      this.saveStateToLocalStorage();
    },
    updateIssueComment() {
      this.saveStateToLocalStorage();
    },
    bookTimeEntry() {
      this.$emit('book-time-entry', this.getState());
    },
    removeTimer() {
      console.log(this.getState())
      this.$emit('remove-timer', this.getState());
    },
    getState() {
      return {
        uniqueTimerId: this.uniqueTimerId,
        id: this.localId,
        title: this.localTitle,
        description: this.localDescription,
        url: this.localUrl,
        elapsedTime: this.elapsedTime,
        lastUpdate: this.lastUpdate,
        isRunning: this.isRunning,
        issueComment: this.issueComment,
        usedTime: this.usedTime,
      }
    }
  },
  watch: {
    // Watch for changes to the issueComment property and save to localStorage
    issueComment: {
      handler(newComment) {
        this.saveStateToLocalStorage();
      },
      deep: true,
    },
  },
  created() {
    this.loadStateFromLocalStorage();

    EventBus.on('timer-started', (uniqueTimerId) => {
      if (uniqueTimerId !== this.uniqueTimerId) {
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
      <div class="row" >

        <!-- First Column: Ticket ID & Subject -->
        <div class="col-8">
          <a :href="localUrl"><small :title="localDescription" class="d-inline-block text-truncate" style="max-width: 100%;" >
            Ticket #{{ localId }} - {{ localTitle }}
        </small></a>
        </div>

        <!-- Second Column: Play, Pause, Stop Buttons -->
        <div class="col-3">
          <div class="btn-group btn-group-sm" role="group"  aria-label="Timer Controls">
            <button class="btn btn-outline-primary" @click.stop="toggleTimer">
              <Play v-if="!isRunning" title="Play"/>
              <Pause v-if="isRunning" title="Pause"/>
            </button>
            <button class="btn btn-outline-danger" @click.stop="stopTimerAndClear">
              <Stop />
            </button>
            <button class="btn btn-outline-warning" @click.stop="removeTimer">
              <Close title="Remove timer" />
            </button>
          </div>
        </div>
        <div class="col-1">
          <button class="btn btn-sm btn-outline-success" @click.stop="bookTimeEntry">
            <SendClock title="Book time" />
          </button>
        </div>

      </div>

      <div class="row" >
        <div class="col-8">
          <!-- Comment Input -->
          <div class="form-group">
            <input class="form-control" v-model="issueComment"
                   @change="updateIssueComment($event)"
                   @blur="updateIssueComment($event)"
                   placeholder="Add a comment..." />
          </div>
        </div>
        <div class="col-4">
          <!-- Timer -->
          <div class="text-right">
            <h1 class="display-6">{{ formatTime(usedTime) }}</h1>
          </div>
        </div>
      </div>
  <hr>
</template>

<style scoped>
</style>
