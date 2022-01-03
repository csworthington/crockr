import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Canvas from '../views/Canvas.vue';
import WebSockets from '../views/WebSockets.vue';
import Web from '../views/Web.vue';

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
    path: '/canvas',
    name: 'Canvas',
    component: Canvas,
  },
  {
    path: '/websockettest',
    name: 'WebSocket Test',
    component: WebSockets,
  },
  {
    path: '/servertest',
    name: 'ServerTest',
    component: () => import('../views/ServerTest.vue'),
  },
  {
    path: '/web',
    name: 'Websocket',
    component: Web,
  },
  {
    path: '/deserialization',
    name: 'Deserialization',
    component: () => import('../views/Deserialization.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
