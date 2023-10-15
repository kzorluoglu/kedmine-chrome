  // apiService.js
  import axios from "axios";
  import db from './databaseService';

  const apiService = {
  async fetchIssueDetails(issueId) {
    const settings = await this.getSettings();

    try {
      const response = await axios.get(`${settings.redmineURL}/issues/${issueId}.json`, {
        headers: await this.getHeaders(),
      });

      return response.data.issue;
    } catch (error) {
      console.error(`There was an error fetching the details for issue ${issueId}:`, JSON.stringify(error, null, 2));
      return null;
    }
  },

  async getSettings() {
    try {
      const settingsArray = await db.settings.toArray();
      return Object.fromEntries(settingsArray.map(item => [item.key, item.value]));
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  },

  async getHeaders() {
    const settings = await this.getSettings();
    let headers = {
      'X-Redmine-API-Key': settings.apiToken,
    };

    if (settings.htaccessUsername && settings.htaccessPassword) {
      headers['Authorization'] = 'Basic ' + btoa(settings.htaccessUsername + ':' + settings.htaccessPassword);
    }
    return headers;
  },

  async fetchCurrentUser() {
    const settings = await this.getSettings();

    if (!settings.redmineURL || !settings.apiToken) {
      const errorMessage = 'Redmine URL or API Token is missing. Please configure in the setup page.';
      console.log(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      let response = await axios.get(`${settings.redmineURL}/users/current.json`, {
        headers: await this.getHeaders(),
      });

      return response.data.user;
    } catch (error) {
      console.error('There was an error fetching the current user:', JSON.stringify(error, null, 2));
    }
  },
 async timeEntries(userId) {
   const settings = await this.getSettings();

   try {
     let response = await axios.get(`${settings.redmineURL}/time_entries.json`, {
        params: {
          user_id: userId,
        },
        headers: await this.getHeaders(),
      });

     return response.data.time_entries;

    } catch (error) {
      console.error('There was an error fetching the time entries:', JSON.stringify(error, null, 2));
      this.isLoading = false;
    }
  },
  async fetchIssuesBySearchTerm(searchTerm) {
    if (!searchTerm) return null;  // If the searchTerm is empty, return null

    const settings = await this.getSettings();

    if (Number(searchTerm)) {
      try {
        const response = await axios.get(`${settings.redmineURL}/issues/${searchTerm}.json`, {
          headers: await this.getHeaders(),
        });

        // Normalize the issue for Timer component
        const normalizedIssue = {
          id: response.data.issue.id,
          title: `${response.data.issue.id} - ${response.data.issue.subject}`,
          url: `${settings.redmineURL}/issues/${response.data.issue.id}`,
          description: response.data.issue.description,
        };

        return [normalizedIssue];

      } catch (error) {
        console.error(`There was an error fetching the issue with ID ${searchTerm}:`, JSON.stringify(error, null, 2));
        return null;
      }
    } else {
      try {
        const response = await axios.get(`${settings.redmineURL}/search.json`, {
          params: {
            q: searchTerm,         // The search query
            object_types: ['issue'],    // To search only issues
          },
          headers: await this.getHeaders(),
        });

        return response.data.results;

      } catch (error) {
        console.error('There was an error searching for the issues:', JSON.stringify(error, null, 2));
        return null;
      }
    }
  },
  async bookTimeEntry(timerState) {
    const settings = await this.getSettings();

    // Create the payload for the time entry
    const timeEntryData = {
      time_entry: {
        issue_id: timerState.id,
        hours: this.elapsedTimeToHours(timerState.usedTime),  // Note: elapsedTimeToHours needs to be defined
        comments: timerState.issueComment
      }
    };

    try {
      await axios.post(`${settings.redmineURL}/time_entries.xml`, timeEntryData, {
        headers: await this.getHeaders(),
      });

      return true;  // Return true on success

    } catch (error) {
      console.error('Error booking the time entry:', error);
      return false;  // Return false on error
    }
  },
  async saveSettings(settings) {
    try {
      await db.settings.bulkPut([
        { key: 'redmineURL', value: settings.redmineURL },
        { key: 'htaccessUsername', value: settings.htaccessUsername },
        { key: 'htaccessPassword', value: settings.htaccessPassword },
        { key: 'apiToken', value: settings.apiToken },
      ]);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
  elapsedTimeToHours(milliseconds) {
    return milliseconds / 3_600_000;  // Convert milliseconds to hours
  },
};

export default apiService;
