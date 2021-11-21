<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('open', (evt: Event) => {
      console.log('a connection has been opened');
    });
    return {
      socket,
    };
  },
});
</script>
