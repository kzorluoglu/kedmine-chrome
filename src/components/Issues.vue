<script>
import Timer from "../components/Timer.vue";
import axios from 'axios';

export default {
  components: {
    Timer,
  },
  data(){
    return {
      foundedIssues: [],
      timeEntries: [],
      currentUser: null,
      isLoading: true,
      searchTerm: '', // for the realtime search,
      runningTimers: [],
    }
  },
  mounted() {
    this.fetchCurrentUser();
  },
  watch: {
    async searchTerm(newTerm) {
      await this.fetchIssuesBySearchTerm();
    }
  },
  methods: {
    startTimerFromIssue(issue) {
      this.runningTimers.push({
        issue: issue,
        startedAt: new Date()
      });
    },
    startTimerFromTimeEntry(entry) {
      this.startTimerFromIssue(entry.detailedIssue);
    },
    getSettings() {
      return {
        redmineURL: localStorage.getItem('redmineURL') || '',
        htaccessUsername: localStorage.getItem('htaccessUsername') || '',
        htaccessPassword: localStorage.getItem('htaccessPassword') || '',
        apiToken: localStorage.getItem('apiToken') || '',
      }
    },
    getAxiosHeaders() {
      const settings = this.getSettings();
      let headers = {
        'X-Redmine-API-Key': settings.apiToken,
      };

      if (settings.htaccessUsername && settings.htaccessPassword) {
        headers['Authorization'] = 'Basic ' + btoa(settings.htaccessUsername + ':' + settings.htaccessPassword);
      }
      return headers;
    },

    async fetchCurrentUser() {
      const settings = this.getSettings();

      if (!settings.redmineURL || !settings.apiToken) {
        console.log('Redmine URL or API Token is missing. Please configure in the setup page.');
        return;
      }

      let headers = this.getAxiosHeaders();

      try {
        let response = await axios.get(`${settings.redmineURL}/users/current.json`, {
          headers: headers,
        });

        this.currentUser = response.data.user;
        await this.fetchTimeEntries();
      } catch (error) {
        console.error('There was an error fetching the current user:', JSON.stringify(error, null, 2));
      }
    },

    syncTimeEntries() {
      this.fetchTimeEntries(true);
    },

    convertTimeEntryToTimerFormat(entry) {
      const settings = this.getSettings();

      // Assume entry.detailedIssue is populated with the result of fetchIssueDetails
      if (entry.detailedIssue) {
        return {
          id: entry.detailedIssue.id,
          title: `${entry.detailedIssue.id} - ${entry.detailedIssue.subject}`,
          url: `${settings.redmineURL}/issues/${entry.detailedIssue.id}`,
          description: entry.detailedIssue.description,
        };
      }
      return null;
    },

    async fetchTimeEntries(getLastEntries = false) {

      const savedTimeEntries = localStorage.getItem('savedTimeEntries');
      if (savedTimeEntries && getLastEntries === false) {
        this.isLoading = false;
        this.timeEntries = JSON.parse(savedTimeEntries);

        return;
      }

      if (!this.currentUser) return;

      const settings = this.getSettings();
      const userId = this.currentUser.id;
      let headers = this.getAxiosHeaders();

      try {
        let response = await axios.get(`${settings.redmineURL}/time_entries.json`, {
          params: {
            user_id: userId,
          },
          headers: headers,
        });

        this.timeEntries = response.data.time_entries;


        for (let entry of this.timeEntries) {
          if (entry.issue && entry.issue.id) {
            entry.detailedIssue = await this.fetchIssueDetails(entry.issue.id);
          }
        }

        // Save to localStorage
        localStorage.setItem('savedTimeEntries', JSON.stringify(this.timeEntries));

        this.isLoading = false;
      } catch (error) {
        console.error('There was an error fetching the time entries:', JSON.stringify(error, null, 2));
        this.isLoading = false;
      }
    },

    async fetchIssueDetails(issueId) {
      const settings = this.getSettings();
      let headers = this.getAxiosHeaders();

      try {
        let response = await axios.get(`${settings.redmineURL}/issues/${issueId}.json`, {
          headers: headers,
        });

        return response.data.issue;
      } catch (error) {
        console.error(`There was an error fetching the details for issue ${issueId}:`, JSON.stringify(error, null, 2));
        return null;
      }
    },

    async fetchIssuesBySearchTerm() {
      if (!this.searchTerm) return; // If the searchTerm is empty, don't do anything

      const settings = this.getSettings();
      let headers = this.getAxiosHeaders();

      if (Number(this.searchTerm)) {
        try {
          let response = await axios.get(`${settings.redmineURL}/issues/${this.searchTerm}.json`, {
            headers: headers,
          });

          // Normalize the issue for Timer component
          const normalizedIssue = {
            id: response.data.issue.id,
            title: `${response.data.issue.id} - ${response.data.issue.subject}`,
            url: `${settings.redmineURL}/issues/${response.data.issue.id}`,
            description: response.data.issue.description
          };

          this.foundedIssues = [normalizedIssue];

        } catch (error) {
          console.error(`There was an error fetching the issue with ID ${this.searchTerm}:`, JSON.stringify(error, null, 2));
        }
      } else {

        try {
          let response = await axios.get(`${settings.redmineURL}/search.json`, {
            params: {
              q: this.searchTerm,         // The search query
              object_types: ['issue'],    // To search only issues
            },
            headers: headers,
          });

          this.foundedIssues = response.data.results; // This will store the fetched issues

        } catch (error) {
          console.error('There was an error searching for the issues:', JSON.stringify(error, null, 2));
        }
      }
    },

  },
  beforeDestroy() {
  },
};
</script>

<template>
  <div class="grid-container">

    <!-- Running Timers Section -->
    <div class="running-timers-list">
      <h3>Not Booked Running Timers</h3>
      <div v-for="(timer, index) in runningTimers" :key="index">
        <Timer :issue="timer.issue" :startedAt="timer.startedAt" />
       </div>
    </div>

    <!-- Search Section -->
    <div class="search-bar">
      <h3>Search via Redmine API</h3>
      <input type="text" v-model="searchTerm" placeholder="Search by issue name, description or id..." class="search-input">
    </div>

    <div class="search-results" v-if="searchTerm.length > 0">
      <h3>Search Results</h3>
      <div v-if="foundedIssues.length === 0">No issues found.</div>
        <div v-for="issue in foundedIssues" :key="issue.id">
          <Timer :issue="issue" />
          <button @click="startTimerFromIssue(issue)">Create Timer</button>
        </div>
    </div>

    <!-- Display Time Entries -->
    <div class="time-entries-list">
      <button @click="syncTimeEntries">Sync</button>
      <h3>My last issues</h3>
      <div v-if="isLoading">Loading...</div>
        <ol class="list-group" v-else v-for="entry in timeEntries" :key="entry.id">
          <Timer :issue="convertTimeEntryToTimerFormat(entry)" />
          <button @click="startTimerFromTimeEntry(entry)">Create Timer</button>
        </ol>
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

.search-results {
  grid-column: 1 / -1; // takes up the full width

  ol.list-group {
    padding: 0;
    margin: 0;
    list-style-type: none;

    li {
      padding: .5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-top: .5rem;

      &:first-child {
        margin-top: 0;
      }
    }
  }
}

</style>
