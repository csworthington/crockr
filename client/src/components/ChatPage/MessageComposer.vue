<template>
  <div>
    <input type="text" v-model="messageText" />
  </div>
  <div>
    <button id="send" name="send" @click="sendMessageOverSocket">Send</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';

export default defineComponent({
  name: 'MessageComposer',
  setup() {
    const socket = useGlobalWebSocket();
    const store = useStore();
    const messageText = ref('');

    /**
     * Send a message over the websocket
     */
    const sendMessageOverSocket = () => {
      console.log(`Sending message: "${messageText.value}"`);
      socket.send(messageText.value);
    };

    return {
      messageText,
      sendMessageOverSocket,
    };
  },
});
</script>
