<template>
  <div>
    <span><button @click="disconnectSocket">Disconnect</button></span><br/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';

export default defineComponent({
  setup() {
    const socket = useGlobalWebSocket();

    const disconnectSocket = () => {
      socket.close(1000);
    };

    return {
      disconnectSocket,
    };
  },
});
</script>
