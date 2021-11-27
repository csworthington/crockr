import { createApp } from 'vue';
import VueNativeSock from 'vue-native-websocket-vue3';
import App from './App.vue';
import router from './router';
import { store } from './store';
import { SocketKey, StoreKey } from './symbols';
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
app.provide(SocketKey, app.config.globalProperties.$socket);

app.mount('#app');

export default App;
