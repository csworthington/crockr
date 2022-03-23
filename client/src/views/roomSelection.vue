<template>
  <div class="room" id = "room">
    <h1>This is the room Selection page</h1>
    <label for="fname">Please enter room code and select room:</label><br>
    <input type="text" id="passCode" name="passCode" value=""><br>
    <label >Please enter a user name</label><br>
    <input type="text" id="username" name="username" value=""><br>
  </div>
  <div class="buttons" id = "buttons">
  </div>
 <span><button @click="routeToCreation" >CreateRoom</button></span>

</template>
<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import router from '@/router';
import { StoreKey } from '@/symbols';
import { useAxios } from '@/utils/useAxios';

export default defineComponent({
  setup() {
    const axios = useAxios();
    const store = useStore(StoreKey);
    const retrievedCookie = document.cookie.split(';');
    console.log('cookie test');
    console.log(retrievedCookie);
    function handleCookie(id : string) {
      console.log('Retrieved cookie');
      console.log(retrievedCookie);
      axios.get('./api/rooms/handlecookie', {
        params: {
          roomID: id,
        },
      }).then((value) => {
        if (value.data === true) {
          console.log('yay');
          store.commit('userID/updateroomID', id);
          console.log(store.state.roomID.ID);
          router.push('/canvas');
        }
      });
    }
    function tryPass(choosenRoom: string) {
      console.log('Hellllo');
      const roomCode = <HTMLInputElement> document.getElementById('passCode');
      const name = <HTMLInputElement> document.getElementById('username');
      axios.get('./api/rooms/tryPass', {
        params: {
          userID: store.state.userID.ID,
          pass: roomCode.value,
          roomID: choosenRoom,
          userName: name.value,
        },
      }).then((value) => {
        if (value.data) {
          console.log('yay');
          store.commit('userID/updateRoomID', choosenRoom);
          console.log(store.state.userID.ID);
          router.push('/canvas');
        }
      });
    }
    function roomSetup() {
      let roomData :string[][] = [[], []];
      axios.get('./api/rooms/getrooms').then((value) => {
        console.log(value.data);
        roomData = value.data;
        console.log(roomData);
        const div = document.getElementById('buttons')!;
        div.innerHTML = '';
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < roomData[0].length; i++) {
          const roomBtn = document.createElement('button');
          roomBtn.innerHTML = roomData[0][i];
          roomBtn.id = roomData[1][i];
          roomBtn.onclick = function () { tryPass(roomBtn.id); };
          div.appendChild(roomBtn);
        }
      });
    }
    if (store.state.userID.roomID !== '-1') {
      router.push('/canvas');
    }
    roomSetup();
    function routeToCreation() {
      console.log('test');
      router.push('/RoomCreator');
    }
    return {
      routeToCreation,
    };
  },
});
</script>
