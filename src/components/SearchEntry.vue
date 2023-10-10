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
          <div class="col-8">
            <a :href="issue.url" target="_blank">
              <small :title="issue.description" class="d-inline-block" style="display:block; max-width: 100%; white-space: normal;">
              Ticket #{{ issue.id }} - {{ issue.title }}
              </small>
            </a>
          </div>
        </div>
</template>

<style scoped>
</style>
