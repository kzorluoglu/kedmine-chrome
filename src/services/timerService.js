//timerService.js
import apiService from "./redmineApiService";
import db from './databaseService';

const timerService = {
  async removeTimerByUniqueId(uniqueTimerId) {
    await db.timers.delete(uniqueTimerId);
  },
  async saveTimeEntries(timeEntries) {
    try {
      return await db.timeEntries.put({ key: 'allTimeEntries', value: JSON.stringify(timeEntries) });
    } catch (error) {
      console.error('Error saving time entries:', error);
    }
  },
  async getTimeEntries() {
    const entry = await db.timeEntries.get('allTimeEntries');
    return entry ? JSON.parse(entry.value) : [];
  },
  async getRunningTimers() {
    return db.timers.toArray();
  },
  async getLastUniqueId() {
    const entry = await db.uniqueId.get('uniqueTimerId');
    return entry ? entry.value : 0;
  },
  async increaseUniqueId() {
    let uniqueTimerId = await this.getLastUniqueId();
    await db.uniqueId.put({key: 'uniqueTimerId', value: uniqueTimerId + 1});
  },
  async createTimer(issue) {
    let uniqueTimerId = await this.getLastUniqueId();
    const settings = await apiService.getSettings();

    const timerState = {
      uniqueTimerId: uniqueTimerId,
      id: issue.id,
      title: issue.title,
      description: issue.description,
      url: issue.url ?? `${settings.redmineURL}/issues/${issue.id}`,
      issueComment: '',
      isRunning: false,
      elapsedTime: 0,
      lastUpdate: null,
    };

    await db.timers.put(timerState);
    await this.increaseUniqueId();

    return timerState;
  },
}

export default timerService;
