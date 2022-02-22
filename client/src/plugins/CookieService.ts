import { App } from 'vue';
import axios from 'axios';
import { store } from '@/store/index';

export default {
  install(
    app: App,
    connectionUrl: string,
    protocol?: string | string[],
  ): void {
    const retrievedCookie = document.cookie.split(';');
    if (retrievedCookie.length === 1 && retrievedCookie[0].split('=').length === 1) {
      axios.get('./api/rooms/getuuid').then((value) => {
        store.commit('userID/updateID', value.data);
        console.log(value.data);
        console.log(store.state.userID);
      });
    }
  },
};
