<template>
  <div class="serverTest">
    <h1>This is the Server Test page</h1>
  </div>
  <input type = 'text' placeholder = "edit me" id = 'msg'>
  <button @click="msgHandle"> send </button>
</template>

<script lang="ts">
import {
  computed, defineComponent, vModelText, WritableComputedRef,
} from 'vue';

export default defineComponent({
  setup() {
    const socket = new WebSocket('ws://localhost:3000');
    function msgHandle() {
      let msgToSend : string;
      const msg = <HTMLInputElement>document.getElementById('msg');
      if (msg !== null) {
        msgToSend = msg.value;
        msg.value = '';
        console.log(msgToSend);
        socket.send(msgToSend);
        // socket.send(msgToSend);
      }
    }
    socket.addEventListener('message', (event) => {
      console.log('Message from server ', event.data);
    });
    return {
      msgHandle,
    };
  },
});
</script>
