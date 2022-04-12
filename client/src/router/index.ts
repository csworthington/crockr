import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Canvas from '../views/Canvas.vue';
import { store } from '@/store';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/roomSelector',
    name: 'RoomSelector',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/roomSelection.vue'),
    beforeEnter(to, from) {
      if (store.state.userID.roomID !== '-1') return { path: '/canvas' };
      return true;
    },
  },
  {
    path: '/RoomCreator',
    name: 'RoomCreator',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/RoomCreator.vue'),
  },
  {
    path: '/canvas',
    name: 'Canvas',
    component: Canvas,
    beforeEnter(to, from) {
      if (store.state.userID.roomID === '-1') return { path: '/roomSelector' };
      return true;
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
