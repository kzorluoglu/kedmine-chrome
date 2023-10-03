<script>
import Timer from "../components/Timer.vue";
import axios from 'axios';

export default {
  components: {
    Timer,
  },
  data(){
    return {
      issues: [],
      searchTerm: '', // for the realtime search
    }
  },
  computed: {
    filteredIssues() {
      return this.issues.filter(issue => {
        return issue.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          issue.id.toString().includes(this.searchTerm) ||
          issue.description.toLowerCase().includes(this.searchTerm);
      });
    }
  },
  mounted() {
    this.fetchIssues();
  },
  methods: {
    getSettings() {
      return {
        redmineURL: localStorage.getItem('redmineURL') || '',
        htaccessUsername: localStorage.getItem('htaccessUsername') || '',
        htaccessPassword: localStorage.getItem('htaccessPassword') || '',
        apiToken: localStorage.getItem('apiToken') || '',
      }
    },
    async fetchIssues() {
      const settings = this.getSettings();

      // Check for necessary information
      if (!settings.redmineURL || !settings.apiToken) {
        console.log('Redmine URL or API Token is missing. Please configure in the setup page.');
        return;
      }

      // Construct headers
      let headers = {
        'X-Redmine-API-Key': settings.apiToken,
      };

      if (settings.htaccessUsername && settings.htaccessPassword) {
        headers['Authorization'] = 'Basic ' + btoa(settings.htaccessUsername + ':' + settings.htaccessPassword);
      }

      try {
        let response = await axios.get(`${settings.redmineURL}/issues.json`, {
          params: {
            // Include any necessary parameters for the API request
          },
          headers: headers,
        });

        this.issues = response.data.issues; // take last 50 issues
        localStorage.setItem('issues', JSON.stringify(this.issues));
      } catch (error) {
        console.error('There was an error fetching the issues:', JSON.stringify(error, null, 2));
        // Try to load from localStorage if the request fails
        this.issues = JSON.parse(localStorage.getItem('issues')) || [];
      }
    }
  },
};
</script>

<template>
  <div class="grid-container">
    <div class="search-bar">
      <input type="text" v-model="searchTerm" placeholder="Search by issue name, description or id..." class="search-input">
    </div>
    <div class="issues-list">
      <div v-for="issue in filteredIssues" :key="issue.id" class="issue-row">
        <Timer :issue="issue"/>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.grid-container {
  display: grid;
  grid-template-columns: 1fr; /* takes up the full width */
  gap: 20px;
}

.search-bar {
  grid-column: 1 / -1; /* takes up the full width */
}

.search-input {
  width: 100%;
  padding: .25rem;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ccc;
  transition: box-shadow .15s ease-in-out;
}

.search-input:focus {
  box-shadow: 0 0 0 .2rem rgba(0,123,255,.25);
  outline: 0;
}

.issues-list {
  display: grid;
  grid-template-columns: 1fr; /* just one full-width column */
  width: 100%; /* takes up the full available width */
}

.issue-row {
  display: grid;
  grid-template-columns: 1fr; /* just one full-width column */
  padding: .25rem 0;
  transition: background 0.2s ease;
  width: 100%; /* takes up the full available width of its container */

  &:hover {
    background: rgba(0,123,255,.15);
  }
}
</style>
