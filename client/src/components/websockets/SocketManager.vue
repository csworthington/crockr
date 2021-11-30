<template>
  <div>
    <span><button @click="connectSocket">Connect</button></span><br/>
    <span><button @click="disconnectSocket">Disconnect</button></span><br/>
    <span><button @click="logSocket">Log Socket</button></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';

export default defineComponent({
  setup() {
    const socket = useGlobalWebSocket();

    const connectSocket = () => {
      if (socket.isConnected === false) {
        socket.connect(process.env.VUE_APP_WEB_SOCKET_URL);
      } else {
        console.log('socket is already connected!');
      }
    };

    const disconnectSocket = () => {
      socket.close(1000);
    };

    const logSocket = () => {
      console.log(socket.getSocket());
    };

    return {
      connectSocket,
      disconnectSocket,
      logSocket,
    };
  },
});
</script>
