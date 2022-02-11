<template>
  <div class="room" id = "room">
    <h1>This is the room Selection page</h1>
    <label for="fname">Please enter room code and select room:</label><br>
    <input type="text" id="passCode" name="passCode" value=""><br>
  </div>
  <div class="buttons" id = "buttons">
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
    interface updateMsg {
      msgType : string;
      msg : string;
    }
    socket.send(JSON.stringify({ msgType: 'roomUpdate' }));
    function selectRoom(roomId : string) {
      const roomCode = <HTMLInputElement> document.getElementById('passCode');
      console.log(roomId);
      console.log(roomCode.value);
      const passwordUpdate : updateMsg = { msgType: 'Password', msg: JSON.stringify([roomId, roomCode.value]) };
      socket.send(JSON.stringify(passwordUpdate));
    }
    let roomData: string[][] = [[], []];

    const listenForRoomMessages = (message: MessageEvent<any>) => {
      const msg : updateMsg = JSON.parse(message.data);
      const parsedMsg = JSON.parse(msg.msg);
      switch (msg.msgType) {
        case 'roomUpdate': {
          roomData = parsedMsg;
          const div = document.getElementById('buttons')!;
          div.innerHTML = '';
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < roomData.length; i++) {
            const roomBtn = document.createElement('button');
            roomBtn.innerHTML = roomData[0][i];
            roomBtn.id = roomData[1][i];
            roomBtn.onclick = function () { selectRoom(roomBtn.id); };
            div.appendChild(roomBtn);
          }
          break;
        }
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
    };

    socket.addEventListener('message', listenForRoomMessages);
    console.log('test');
  },
});
</script>
