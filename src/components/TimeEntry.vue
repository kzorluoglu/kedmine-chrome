<script>
import { EventBus } from "../eventBus";

export default {
  name: 'TimeEntry',
  props: {
    entry: 'Object'
  },
  data() {
    return {
    };
  },
  computed: {
  },
  methods: {
  }
}
</script>

<template>
    <li class="list-group-item">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1" :title="entry.detailedIssue.subject"> #{{ entry.issue.id }}  {{ entry.detailedIssue.subject }}</h5>
            <small>{{ entry.hours }}</small>
        </div>
        <p class="mb-1">{{ entry.comments }}</p>
        <small>And some small print.</small>
    </li>
</template>

<style scoped>
</style>
