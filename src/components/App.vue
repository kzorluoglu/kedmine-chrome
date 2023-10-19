<template>
  <div id="app">
    <!-- Simple Bootstrap Navigation -->
    <ul class="nav ">
      <li class="nav-item">
        <router-link to="/issues" class="nav-link">Issues</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/csv-to-redmine-table" class="nav-link">CSV to Redmine Table Converter</router-link>
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
</style>
<script>

export default {
}
</script>

