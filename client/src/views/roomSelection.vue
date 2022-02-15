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
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';
import router from '@/router';
import { StoreKey } from '@/symbols';
import { useAxios } from '@/utils/useAxios';

export default defineComponent({
  setup() {
    const axios = useAxios();
    const socket = useGlobalWebSocket();
    const store = useStore(StoreKey);
    interface updateMsg{
      msgType : string;
      msg : string;
    }
    function selectRoom(roomId : string) {
      console.log('Hellllooo');
      const roomCode = <HTMLInputElement> document.getElementById('passCode');
      console.log(roomId);
      console.log(roomCode.value);
      const passwordUpdate : updateMsg = { msgType: 'Password', msg: JSON.stringify([roomId, roomCode.value]) };
      socket.send(JSON.stringify(passwordUpdate));
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
    roomSetup();
    function routeToCreation() {
      console.log('test');
      router.push('/RoomCreator');
    }
    socket.addEventListener('message', (message) => {
    // const msg = JSON.parse(message.data.ToString());
      const msg = JSON.parse(message.data);
      const parsedMsg = JSON.parse(msg.msg);
      switch (msg.msgType) {
        case 'Verification': {
          const parsedObject = JSON.parse(msg.msg);
          if (parsedObject[0]) {
            console.log('yay');
            console.log(parsedObject[1]);
            store.commit('roomID/updateID', parsedObject[1]);
            console.log(store.state.roomID.ID);
            router.push('/canvas');
          } else {
            alert('wrong room code or room');
          }
          break;
        }
        default: {
          console.log('unknown message');
          break;
        }
      }
    });
    return {
      routeToCreation,
    };
  },
});
</script>
