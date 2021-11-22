<template>
  <div class="websockets">
    This is the websockets page
    <WebSocketStatusIndicator/>
  </div>
  <WebSocketManager/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import WebSocketManager from '@/components/websockets/WebSocketManager.vue';
import WebSocketStatusIndicator from '@/components/websockets/WebSocketStatusIndicator.vue';

export default defineComponent({
  components: {
    WebSocketManager,
    WebSocketStatusIndicator,
  },
  setup() {
    return {};
  },
});
</script>
