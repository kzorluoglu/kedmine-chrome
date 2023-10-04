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
  width: 600px;
}
</style>
<script setup>
</script>
