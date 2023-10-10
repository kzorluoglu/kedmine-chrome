<script>
import Timer from "../components/Timer.vue";
import TimeEntry from "../components/TimeEntry.vue";
import SearchEntry from "../components/SearchEntry.vue";
import axios from 'axios';

export default {
  components: {
    Timer,
    TimeEntry,
    SearchEntry,
  },
  data() {
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

    this.loadRunningTimersFromLocalStorage();
  },
  watch: {
    async searchTerm() {
      await this.fetchIssuesBySearchTerm();
    }
  },
  methods: {
    async loadRunningTimersFromLocalStorage() {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('timerState_')) {
          const timerState = JSON.parse(localStorage.getItem(key));
          // Do something with timerState, for example:
          this.runningTimers.push(timerState);
        }
      });
    },
    startTimerFromIssue(issue) {
      // Retrieve the uniqueTimerId from localStorage and parse it as an integer
      // If it's not set yet, default it to 0
      let uniqueTimerId = parseInt(localStorage.getItem('uniqueTimerId')) || 0;

      const timerState = {
        uniqueTimerId: uniqueTimerId,
        id: issue.id,
        title: issue.title,
        description: issue.description,
        url: issue.url,
        issueComment: '',
        isRunning: false,
        elapsedTime: 0,
        lastUpdate: null,
      };

      this.runningTimers.push(timerState);

      localStorage.setItem('timerState_' + uniqueTimerId, JSON.stringify(timerState));

      // Increment uniqueTimerId for the next timer and store it back in localStorage
      localStorage.setItem('uniqueTimerId', uniqueTimerId + 1);
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
    convertDecimalHoursToMilliseconds(decimalHours) {
      return decimalHours * 3_600_000;  // Convert hours to milliseconds
    },
      convertTimeEntryToTimerFormat(entry) {
        const settings = this.getSettings();

        // Assume entry.detailedIssue is populated with the result of fetchIssueDetails
        if (entry.detailedIssue) {

          // Convert entry.hours into milliseconds
          const elapsedTime = this.convertDecimalHoursToMilliseconds(entry.hours);

          return {
            id: entry.detailedIssue.id,
            title: entry.detailedIssue.subject,
            url: `${settings.redmineURL}/issues/${entry.detailedIssue.id}`,
            description: entry.detailedIssue.description,
            elapsedTime
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
    handleRemoveTimer(timerState)
    {
      console.log(timerState)
      this.removeTimer(timerState.uniqueTimerId);
    },
    handleStartTimer(issue) {
      this.startTimerFromIssue(issue);
    },
    elapsedTimeToHours(milliseconds) {
      return milliseconds / 3_600_000;  // Convert milliseconds to hours
    },
    async handleBookTimeEntry(timerState) {

      const settings = this.getSettings();
      const headers = this.getAxiosHeaders();

      // Create the payload for the time entry
      const timeEntryData = {
        time_entry: {
          issue_id: timerState.id,
          hours: this.elapsedTimeToHours(timerState.usedTime),
          comments: timerState.issueComment
        }
      };

      try {
        await axios.post(`${settings.redmineURL}/time_entries.xml`, timeEntryData, {
          headers: headers,
        });

        this.removeTimer(timerState.uniqueTimerId);

        console.log('Time entry booked successfully');
      } catch (error) {
        console.error('Error booking the time entry:', error);
      }
    },

    removeTimer(uniqueTimerId) {
      // Remove from runningTimers
      console.log(uniqueTimerId)
      this.runningTimers = this.runningTimers.filter(timer => timer.uniqueTimerId !== uniqueTimerId);

      // Remove from localStorage
      localStorage.removeItem('timerState_' + uniqueTimerId);
    },
  },
  beforeDestroy() {
  },
};
</script>

<template>

  <!-- Running Timers -->
  <div class="row" v-if="runningTimers.length > 0">
    <div class="col-12">
      <h5>Running Timers</h5>
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <Timer
        v-for="(issue, index) in runningTimers" :key="index"
        :uniqueTimerId="issue.uniqueTimerId"
        :id="issue.id"
        :title="issue.title"
        :description="issue.description"
        :url="issue.url"
        @book-time-entry="handleBookTimeEntry"
        @remove-timer="handleRemoveTimer"
      />
    </div>
  </div>

  <!-- Search -->
  <div class="row mt-3 mb-3">
    <div class="col-12">
      <h5>Search via Redmine API</h5>
    </div>
    <div class="col-12">
      <input type="text" class="form-control" v-model="searchTerm"
             placeholder="Search by issue name, description or id">
    </div>
  </div>
  <div class="row mt-3 mb-3" v-if="searchTerm.length > 0">
    <div class="col-12">
        <h3>Search Results</h3>
        <div v-if="foundedIssues.length === 0">No issues found.</div>
        <SearchEntry :issue="issue"
                     v-for="issue in foundedIssues"
                     :key="issue.id"
                     @start-timer-for-issue="handleStartTimer"
        />
    </div>
  </div>

    <!-- Display Time Entries -->
    <div class="time-entries-list">
      <div class="row">
        <div class="col-9">
          <h5>My last issues</h5>
        </div>
        <div class="col-3">
          <button class="btn btn-sm btn-outline-secondary" @click="syncTimeEntries">Sync</button>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div v-if="isLoading">Loading...</div>
          <TimeEntry :issue="convertTimeEntryToTimerFormat(entry)"
                     v-for="entry in timeEntries"
                     :key="entry.id"
                     @start-timer-for-issue="handleStartTimer"
          />
        </div>
      </div>



    </div>
</template>


<style lang="less">

</style>
