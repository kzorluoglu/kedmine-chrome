<template>
  <div id="app">
    <nav class="navbar">
      <router-link to="/" class="nav-link">Issues</router-link>
      <router-link to="/setup" class="nav-link">Setup </router-link>
    </nav>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>
<style >
body {
  display: flex;
  flex-direction: column;
  font-family:
    Roboto,
    -apple-system,
    BlinkMacSystemFont,
    'Helvetica Neue',
    'Segoe UI',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Open Sans',
    sans-serif;
  color: #86a5b1;
  background-color: #2f3241;
  width: 800px;
}

* {
  padding: 0;
  margin: 0;
}

ul {
  list-style: none;
}

a {
  color: #9feaf9;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  outline: none;
}

a:hover {
  border-bottom: 1px solid;
}

#app {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px 30px 0 30px;
}

.navbar {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2d3252;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-link {
  margin: 0 10px;
  color: #007bff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid #007bff;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
}

.nav-link:hover {
  background-color: #007bff;
  color: #fff;
}

.container {
  padding: 0.3rem;
}

</style>

