<template>
  <div class="websockets">
    This is the websockets page
    <WebSocketStatusIndicator/>
  </div>
  <div>
    <MessageComposer />
  </div>
  <!-- <WebSocketManager/> -->
  <SocketManager />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import SocketManager from '@/components/websockets/SocketManager.vue';
import WebSocketStatusIndicator from '@/components/websockets/WebSocketStatusIndicator.vue';
import MessageComposer from '@/components/ChatPage/MessageComposer.vue';

export default defineComponent({
  components: {
    // WebSocketManager,
    SocketManager,
    WebSocketStatusIndicator,
    MessageComposer,
  },
  setup() {
    return {};
  },
});
</script>
