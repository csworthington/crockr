<template>
  <div class="room" id = "room">
    <h1>This is the room Selection page</h1>
    <label for="fname">Please enter room code and select room:</label><br>
    <input type="text" id="passCode" name="passCode" value=""><br>
  </div>
  <div class="buttons" id = "buttons">
  </div>
 <span><button @click="routeToCreation" >CreateRoom</button></span>

</template>
<script lang="ts">
import { defineComponent } from 'vue';
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
          store.commit('roomID/updateID', id);
          console.log(store.state.roomID.ID);
          router.push('/canvas');
        }
      });
    }
    function tryPass(choosenRoom: string) {
      console.log('Hellllo');
      const roomCode = <HTMLInputElement> document.getElementById('passCode');
      axios.get('./api/rooms/tryPass', {
        params: {
          pass: roomCode.value,
          roomID: choosenRoom,
        },
      }).then((value) => {
        if (value.data) {
          console.log('yay');
          store.commit('roomID/updateID', choosenRoom);
          document.cookie = `RoomID = ${choosenRoom}`;
          console.log(store.state.roomID.ID);
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
    if (retrievedCookie.length > 1) {
      handleCookie(retrievedCookie[1].split('=')[1]);
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
