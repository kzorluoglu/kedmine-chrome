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
#app {
  width: 600px;
  margin: 0 auto; /* Centers the app in the middle of the page */
}
.grid-container {
  overflow-x: auto; /* to allow horizontal scrolling */
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

