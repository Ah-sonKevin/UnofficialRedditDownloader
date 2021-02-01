import { store } from '@/store';
import AuthStore from '@/store/authStore';
import About from '@/views/About.vue';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Manager from '@/views/Manager.vue';
import NotFound from '@/views/NotFound.vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { getModule } from 'vuex-module-decorators';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/manager',
    component: Manager,
    name: 'Manager',
    props: true,
    beforeEnter() {
      const authModule = getModule(AuthStore, store);

      if (authModule.isConnected) {
        return true;
      }
      return { name: 'Home' };
    },
  },
  {
    path: '/login',
    component: Login,
    name: 'Login',
    beforeEnter(to) {
      const query = to.query;
      if (!(query && query.state && query.code)) {
        return { name: 'Home' };
      }
      return true;
    },
  },

  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: About,
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/:path(.*)*',
    name: 'notFound',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
