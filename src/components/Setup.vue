<template>
  <div class="setup-container">
    <h2>Redmine Setup</h2>
    <div class="input-group">
      <label for="redmineURL">Redmine URL:</label>
      <input id="redmineURL" v-model="redmineURL" placeholder="Enter Redmine URL" />
    </div>
    <div class="input-group">
      <label for="htaccessUsername">*Optional - Redmine htaccess Username:</label>
      <input id="htaccessUsername" v-model="htaccessUsername" placeholder="Enter htaccess Username" />
    </div>
    <div class="input-group">
      <label for="htaccessPassword">*Optional - htaccess Password:</label>
      <input type="password" id="htaccessPassword" v-model="htaccessPassword" placeholder="Enter htaccess Password" />
    </div>
    <div class="input-group">
      <label for="apiToken">User API Token:</label>
      <input id="apiToken" type="password" v-model="apiToken" placeholder="Enter User API Token" />
    </div>
    <button class="save-button" @click="saveSettings">Save</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      redmineURL: '',
      htaccessUsername: '',
      htaccessPassword: '',
      apiToken: '',
    }
  },
  mounted() {
    this.redmineURL = localStorage.getItem('redmineURL') || '';
    this.htaccessUsername = localStorage.getItem('htaccessUsername') || '';
    this.htaccessPassword = localStorage.getItem('htaccessPassword') || '';
    this.apiToken = localStorage.getItem('apiToken') || '';
  },
  methods: {
    saveSettings() {
      // Save the settings to localStorage or any other place you'd prefer.
      // For this example, we'll use localStorage
      localStorage.setItem('redmineURL', this.redmineURL);
      localStorage.setItem('htaccessUsername', this.htaccessUsername);
      localStorage.setItem('htaccessPassword', this.htaccessPassword);
      localStorage.setItem('apiToken', this.apiToken);

      // Maybe redirect user to another page or give a success message.
      this.$router.push('/');  // redirect to home page
    }
  }
}
</script>

<style scoped>
.setup-container {
  width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

.setup-container h2 {
  margin-bottom: 1rem;
}

.input-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box; /* Add this line */
}


input:focus {
  border-color: #007bff;
  outline: none;
}

.save-button {
  display: block;
  width: 100%;
  padding: 10px 15px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.save-button:hover {
  background-color: #0056b3;
}

</style>
