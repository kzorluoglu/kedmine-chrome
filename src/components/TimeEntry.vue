<script>

export default {
  name: 'TimeEntry',
  props: {
    issue: 'Object'
  },
  data() {
    return {
      showDescription: false,
    };
  },
  methods: {
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
    startNewTimer() {
      this.$emit('start-timer-for-issue', this.issue);
    }
  },
};
</script>

<template>
      <div class="row border-bottom" >
          <!-- First Column: Re-Start -->
          <div class="col-2">
            <button class="btn btn-primary btn-sm" @click="startNewTimer">New Timer</button>
          </div>
          <div class="col-2">
            <span class="overflow-hidden">{{ formatTime(this.issue.elapsedTime) }}</span>
          </div>
          <div class="col-8">
            <a :href="issue.url" target="_blank">
              <small :title="issue.description"  class="d-inline-block text-truncate" style="display:block; max-width: 100%; white-space: normal;">
              Ticket #{{ issue.id }} - {{ issue.title }}
              </small>
            </a>
          </div>
        </div>
</template>

<style scoped>
</style>
