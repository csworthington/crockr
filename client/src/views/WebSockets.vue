<template>
  <div class="websockets">
    This is the websockets page
    <WebSocketManager/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import WebSocketManager from '@/components/WebSocketManager.vue';

export default defineComponent({
  components: {
    WebSocketManager,
  },
  setup() {
    return {};
  },
});
</script>
