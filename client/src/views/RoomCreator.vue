<template>
  <div class="room" id = "room">
    <h1>This is the room Creation page</h1>
    <label for="fname">Please enter the name of the room</label><br>
    <input type="text" id="roomName" name="roomName" value=""><br>
    <span><button @click="sendRoom" >CreateRoom</button></span>
  </div>

</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';
import router from '@/router';
import { StoreKey } from '@/symbols';

export default defineComponent({
  setup() {
    const socket = useGlobalWebSocket();
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
    socket.addEventListener('message', (message) => {
    // const msg = JSON.parse(message.data.ToString());
      const msg = JSON.parse(message.data);
      const parsedMsg = JSON.parse(msg.msg);
      switch (msg.msgType) {
        case 'Verification': {
          store.commit('roomID/updateID', msg.roomId);
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
    };
  },
});
</script>
