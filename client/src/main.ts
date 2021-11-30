import { createApp } from 'vue';
import VueNativeSock from 'vue-native-websocket-vue3';
import axios from 'axios';
import VueAxios from 'vue-axios';
import App from './App.vue';
import router from './router';
import { store } from './store';
import { axiosInjectionKey, SocketKey, StoreKey } from './symbols';
import GlobalSocket from '@/plugins/websocket/GlobalWebSocket';

const app = createApp(App);

app.use(store, StoreKey);
app.use(router);
// app.use(VueNativeSock, process.env.VUE_APP_WEB_SOCKET_URL, {
//   store,
//   connectManually: true,
// });
app.use(GlobalSocket, process.env.VUE_APP_WEB_SOCKET_URL, {
  store,
  connectManually: true,
});
app.use(VueAxios, axios);
app.provide(axiosInjectionKey, app.config.globalProperties.axios); // Provide axios globally

app.mount('#app');

export default App;
