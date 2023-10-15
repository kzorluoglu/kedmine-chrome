// databaseService.js
import Dexie from 'dexie';

const db = new Dexie('kedmineDatabase');
db.version(1).stores({
  settings: 'key,value',
  timers: 'uniqueTimerId,id,title,description,url,issueComment,isRunning,elapsedTime,lastUpdate',
  timeEntries: 'key,value',
  uniqueId: 'key,value'
});

export default db;
