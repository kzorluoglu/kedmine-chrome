import { createApp } from "vue";
import App from "./js/App.vue";
import router from './router' // Assuming your router configuration is in 'router/index.js'
import 'bootstrap/dist/css/bootstrap.css';
import { EventBus } from "./eventBus";  // adjust path as necessary

const app = createApp(App)

chrome.runtime.onMessage.addListener((message) => {
  console.log("Creating a new timer!");

  if (message.action === 'create-new-timer') {
    console.log("Creating a new timer!");
    EventBus.emit('create-new-timer');
  }
});

app.use(router) // This is how you inject the router into the Vue app
// Mount the app to the DOM
app.mount('#app');

