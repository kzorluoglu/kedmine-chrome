<script>
import Timer from "../components/Timer.vue";
import TimeEntry from "../components/TimeEntry.vue";
import SearchEntry from "../components/SearchEntry.vue";
import {EventBus} from "../eventBus";
import { shortcodeEventData } from "../interfaces/shortcodeEventData"
import redmineApiService from "../services/redmineApiService"
import timerService from "../services/timerService"

export default {
  components: {
    Timer,
    TimeEntry,
    SearchEntry,
  },
  data() {
    return {
      foundedIssues: [],
      timerEntries: [],
      currentUser: null,
      isLoading: true,
      searchTerm: '', // for the realtime search,
      runningTimers: [],
    }
  },
  created() {
    EventBus.on('create-new-timer', this.createNewTimerViaShortcode);
  },
  async mounted() {
    try {
      this.currentUser = await redmineApiService.fetchCurrentUser()

    } catch (error) {
      this.$router.push('setup');  // redirect to home page
      console.error(error.message);
    }
    await this.fetchTimeEntries();
    await this.loadRunningTimers();
  },
  watch: {
    async searchTerm() {
      await this.fetchIssuesBySearchTerm();
    }
  },
  methods: {
    /**
     * @param {shortcodeEventData} eventData
     */ async createNewTimerViaShortcode(eventData) {
      const issue = await redmineApiService.fetchIssueDetails(eventData.issueId);
      this.startTimerFromIssue(issue);
    },
    async loadRunningTimers() {
      const timerStates = await timerService.getRunningTimers();
      this.runningTimers = [...this.runningTimers, ...timerStates];
    },
    async startTimerFromIssue(issue) {
      const createdTimer = await timerService.createTimer(issue);
      this.runningTimers.push(createdTimer);
    },

    async syncTimeEntries() {
      await this.fetchTimeEntries(true);
    },
    convertDecimalHoursToMilliseconds(decimalHours) {
      return decimalHours * 3_600_000;  // Convert hours to milliseconds
    },
    async convertTimeEntryToTimerFormat(entry) {
      const settings = await redmineApiService.getSettings();

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
      try {
        if (!this.currentUser) return;

        const savedTimeEntries = await timerService.getTimeEntries();
        if (savedTimeEntries.length > 0 && !getLastEntries) {
          await this.updateTimeEntries(savedTimeEntries);
        } else {
          await this.fetchAndSaveTimeEntriesFromAPI();
        }
      } catch (error) {
        console.error('Error fetching time entries:', error);
        this.isLoading = false;  // Ensure loading is set to false in case of error
      }
    },

    async updateTimeEntries(savedTimeEntries) {
      let formatEntries = await this.convertAllTimeEntriesToTimerFormat(savedTimeEntries);
      this.timerEntries = formatEntries.filter(entry => entry !== null);
      // Filter out null entries
      this.isLoading = false;
    },

    async fetchAndSaveTimeEntriesFromAPI() {
      let timeEntries = await redmineApiService.timeEntries(this.currentUser.id);
      for (let entry of timeEntries) {
        if (entry.issue && entry.issue.id) {
          entry.detailedIssue = await redmineApiService.fetchIssueDetails(entry.issue.id);
        }
      }
      await timerService.saveTimeEntries(timeEntries);
      this.timerFormatEntries = await this.convertAllTimeEntriesToTimerFormat(timeEntries);
      this.isLoading = false;
    },

    async convertAllTimeEntriesToTimerFormat(timeEntries) {
      return Promise.all(timeEntries.map(entry => {
        return this.convertTimeEntryToTimerFormat(entry);
      }));
    },

    async fetchIssuesBySearchTerm() {
      if (!this.searchTerm) return; // If the searchTerm is empty, don't do anything

      const foundedIssues = await redmineApiService.fetchIssuesBySearchTerm(this.searchTerm);
      if (foundedIssues) {
        this.foundedIssues = foundedIssues;
      }
    },
    handleRemoveTimer(timerState) {
      this.removeTimer(timerState.uniqueTimerId);
    },
    async handleStartTimer(issue) {
      await this.startTimerFromIssue(issue);
    },
    async handleBookTimeEntry(timerState)
    {
      const success = await redmineApiService.bookTimeEntry(timerState);
      if (success) {
        this.removeTimer(timerState.uniqueTimerId);
      }
    },
    removeTimer(uniqueTimerId) {
      // Remove from runningTimers
      this.runningTimers = this.runningTimers.filter(timer => timer.uniqueTimerId !== uniqueTimerId);

      timerService.removeTimerByUniqueId(uniqueTimerId)
    },
  },
  beforeDestroy() {
    EventBus.off('create-new-timer', this.createNewTimerViaShortcode);
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
        v-for="issue in runningTimers" :key="issue.uniqueTimerId"
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
      <SearchEntry v-for="issue in foundedIssues"
                   :issue="issue"
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
        <TimeEntry v-for="entry in timerEntries"
                   :issue="entry"
                   :key="entry.id"
                   @start-timer-for-issue="handleStartTimer"
        />
      </div>
    </div>


  </div>
</template>


<style lang="less">

</style>
