import { App } from 'vue';
import axios from 'axios';
import { store } from '@/store/index';

export default {
  async install(
    app: App,
    connectionUrl: string,
    protocol?: string | string[],
  ): Promise<void> {
    const retrievedCookie = document.cookie.split(';');
    if (retrievedCookie.length === 1 && retrievedCookie[0].split('=').length === 1) {
      await axios.get('./api/rooms/getuuid').then((value) => {
        store.commit('userID/updateID', value.data);
        console.log(value.data);
        console.log(store.state.userID.ID);
        document.cookie = `UserID = ${value.data}`;
      });
    } else {
      console.log(retrievedCookie[0].split('=')[1]);
      store.commit('userID/updateID', retrievedCookie[0].split('=')[1]);
      await axios.get('./api/rooms/getroomid', {
        params: {
          userID: store.state.userID.ID,
        },
      }).then((value) => {
        store.commit('userID/updateRoomID', value.data);
        console.log(`value :${value.data}`);
        console.log(`store room :${store.state.userID.roomID}`);
        console.log(`store userID :${store.state.userID.ID}`);
      });
    }
  },
};
