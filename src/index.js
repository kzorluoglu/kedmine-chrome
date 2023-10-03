import { createApp } from "vue";
import App from "./js/App.vue";
import router from './router' // Assuming your router configuration is in 'router/index.js'

const app = createApp(App)

app.use(router) // This is how you inject the router into the Vue app

// Mount the app to the DOM
app.mount('#app');

