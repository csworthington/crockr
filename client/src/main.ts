import { createApp } from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import App from './App.vue';
import router from './router';
import store from './store';
import { axiosInjectionKey } from './symbols';

const app = createApp(App);
app.use(store);
app.use(router);
app.use(VueAxios, axios);
app.provide(axiosInjectionKey, app.config.globalProperties.axios); // Provide axios globally

app.mount('#app');
