<template>
  <div>
    <span><button @click="createConnection">Create Connection</button></span>
    <span><button @click="sendPing(socket)">Ping</button></span>
    <span><button @click="sendMessage">Send Message</button></span>
  </div>
</template>

<script lang="ts">
import {
  ComponentInternalInstance, defineComponent, getCurrentInstance, onMounted,
} from 'vue';

import { Websocket } from 'websocket-ts/lib';
import { createNewWebSocket, vanillaCreateSocket } from '@/socket';
import { SocketKey } from '@/symbols';

export default defineComponent({
  setup() {
    onMounted(() => {
      const { proxy } = getCurrentInstance() as ComponentInternalInstance;
      if (proxy !== null) {
        console.log(proxy);
        console.log(proxy?.$socket);
      }
    });
    const createConnection = () => {
      console.log('in create conn');
      const { proxy } = getCurrentInstance() as ComponentInternalInstance;
      if (proxy !== null) {
        proxy.$connect(process.env.VUE_APP_WEB_SOCKET_URL);
      } else {
        throw new Error('getCurrentInstance returned null');
      }
    };

    const handlePong = () => {
      console.log('pong received');
    };

    const sendPing = (sock: WebSocket) => {
      sock.send('browserPing');
      console.dir(sock);
    };

    const sendMessage = () => {
      const { proxy } = getCurrentInstance() as ComponentInternalInstance;
      // proxy.$socket.send('data');
    };

    return {
      createConnection,
      sendMessage,
      sendPing,
    };
  },
});
</script>
