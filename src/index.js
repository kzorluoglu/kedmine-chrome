import { createApp } from "vue";
import App from "./js/App.vue";
import router from './router' // Assuming your router configuration is in 'router/index.js'
import 'bootstrap/dist/css/bootstrap.css';

const app = createApp(App)


// Define a global property
app.config.globalProperties.createNewTimer = function() {
  // This is just a dummy console log to see if the function is invoked
  console.log("New timer should be created here!");

  // Logic to communicate with your App.vue or any other component
  // to actually create a timer or set properties
};

app.use(router) // This is how you inject the router into the Vue app

// Mount the app to the DOM
app.mount('#app');

