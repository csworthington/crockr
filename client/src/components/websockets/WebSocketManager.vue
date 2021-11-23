<template>
  <div>
    <span><button @click="createConnection">Create Connection</button></span>
    <span><button @click="sendPing(socket)">Ping</button></span>
    <span><button @click="sendMessage(socket)">Send Message</button></span>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';

import { Websocket } from 'websocket-ts/lib';
import { createNewWebSocket, vanillaCreateSocket } from '@/socket';
import { SocketKey } from '@/symbols';

export default defineComponent({
  setup() {
    let skt = inject(SocketKey);
    console.log(skt);
    const socket = null;

    const createConnection = () => {
      // const ws = createNewWebSocket('ws://localhost:3000');
      // console.dir(ws.underlyingWebsocket);
      // console.log(ws.underlyingWebsocket?.readyState);
      // console.log(`closed=${ws.underlyingWebsocket?.CLOSED},
      // closing=${ws.underlyingWebsocket?.CLOSING},
      // opening=${ws.underlyingWebsocket?.CONNECTING}, open=${ws.underlyingWebsocket?.OPEN}`);
      // socket = ws;
      skt = vanillaCreateSocket(process.env.WEB_SOCKET_URL);
      if (skt === null) {
        console.error('socket is null');
      } else {
        console.log(`socket status = ${skt?.readyState}`);
      }
    };
    const handlePong = () => {
      console.log('pong received');
    };

    const sendPing = (sock: WebSocket) => {
      sock.send('browserPing');
      console.dir(sock);
    };

    const sendMessage = (sock: WebSocket) => {
      sock.send('some message');
    };

    return {
      createConnection,
      socket,
      sendPing,
    };
  },
});
</script>
