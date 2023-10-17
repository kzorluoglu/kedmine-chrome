import { createRouter, createWebHashHistory } from 'vue-router';
import Setup from "./components/Setup.vue";
import Issues from "./components/Issues.vue";
import redmineApiService from './services/redmineApiService';  // <== add this import to the top part of `encryption.js`

const routes = [
  {
    path: '/',
    redirect: '/issues', // Redirect root path to /issues
    meta: { requiresSetup: true }
  },
  {
    path: '/issues', // Change path to '/issues'
    name: 'Issues',
    component: Issues,
    meta: { requiresSetup: true }
  },
  {
    path: '/setup',
    name: 'Setup',
    component: Setup,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'active',
  routes,
});

router.beforeEach(async (to, from, next) => {
  const settings = await redmineApiService.getSettings(); // <== use the getSettings function here
  const isSetupComplete = settings.redmineURL && settings.apiToken; // <== check settings from DB here

  if (to.matched.some(record => record.meta.requiresSetup) && !isSetupComplete) {
    next({path: '/setup'}); // Redirect to setup page if setup is not complete
  } else {
    next(); // Otherwise continue
  }
});

export default router;
