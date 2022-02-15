<template>
  <div class="room" id = "room">
    <h1>This is the room Creation page</h1>
    <label for="fname">Please enter the name of the room</label><br>
    <input type="text" id="roomName" name="roomName" value=""><br>
    <span><button @click="createRoom" >CreateRoom</button></span>
  </div>

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
    const socket = useGlobalWebSocket();
    const axios = useAxios();
    const store = useStore(StoreKey);
    interface updateMsg{
      msgType : string;
      roomId: string;
      msg : string;
    }
    function sendRoom() {
      const name = <HTMLInputElement> document.getElementById('roomName');
      const roomMsg = { msgType: 'addRoom', roomId: store.state.roomID.ID, msg: name.value };
      socket.send(JSON.stringify(roomMsg));
    }
    function createRoom() {
      const name = <HTMLInputElement> document.getElementById('roomName');
      axios.get('./api/rooms/createroom', {
        params: {
          name: name.value,
        },
      }).then((value) => {
        store.commit('roomID/updateID', value.data);
        router.push('/canvas');
      });
    }
    socket.addEventListener('message', (message) => {
    // const msg = JSON.parse(message.data.ToString());
      const msg = JSON.parse(message.data);
      const parsedMsg = JSON.parse(msg.msg);
      switch (msg.msgType) {
        case 'RoomVerification': {
          console.log(msg.roomId);
          console.log(parsedMsg);
          store.commit('roomID/updateID', parsedMsg);
          router.push('/canvas');
          break;
        }
        default: {
          console.log('unknown message');
          break;
        }
      }
    });
    return {
      sendRoom,
      createRoom,
    };
  },
});
</script>
