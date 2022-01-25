<template>
  <div class="room">
    <h1>This is the room Selection page</h1>
    <label for="fname">Please enter room code and select room:</label><br>
    <input type="text" id="passCode" name="passCode" value=""><br>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';
import router from '@/router';

export default defineComponent({
  setup() {
    const socket = useGlobalWebSocket();
    interface updateMsg{
      msgType : string;
      msg : string;
    }
    function selectRoom(roomId : string) {
      const roomCode = <HTMLInputElement> document.getElementById('passCode');
      console.log(roomId);
      console.log(roomCode.value);
      const passwordUpdate : updateMsg = { msgType: 'Password', msg: JSON.stringify([roomId, roomCode.value]) };
      socket.send(JSON.stringify(passwordUpdate));
    }
    let roomData: string[][] = [[], []];
    socket.addEventListener('message', (message) => {
    // const msg = JSON.parse(message.data.ToString());
      const msg = JSON.parse(message.data);
      const parsedMsg = JSON.parse(msg.msg);
      switch (msg.msgType) {
        case 'roomUpdate': {
          roomData = parsedMsg;
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < roomData.length; i++) {
            const roomBtn = document.createElement('button');
            roomBtn.innerHTML = roomData[0][i];
            roomBtn.id = roomData[1][i];
            roomBtn.onclick = function () { selectRoom(roomBtn.id); };
            document.body.appendChild(roomBtn);
          }
          break;
        }
        case 'Verification': {
          const verified = JSON.parse(msg.msg);
          if (verified) {
            console.log('yay');
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
    console.log('test');
  },
});
</script>
