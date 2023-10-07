<template>
  <div id="app">
    <!-- Simple Bootstrap Navigation -->
    <ul class="nav ">
      <li class="nav-item">
        <router-link to="/issues" class="nav-link">Issues</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/setup" class="nav-link">Setup</router-link>
      </li>
    </ul>
    <!-- Content Container -->
    <div class="container mt-4">
      <router-view></router-view>
    </div>
  </div>
</template>
<style>
body {
  width: 600px !important;
  max-width: 600px !important;
  min-width: 600px !important;
}
</style>
<script>
import { EventBus } from "../eventBus";

export default {
  created() {
    EventBus.on('create-new-timer', this.handleCreateNewTimer);
  },
  beforeDestroy() {
    EventBus.off('create-new-timer', this.handleCreateNewTimer);
  },
  methods: {
    handleCreateNewTimer() {
      // Your logic to create a new timer goes here
      console.log("Creating a new timer!");
    }
  }
}
</script>

