<template>
  <SocketTest></SocketTest>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SocketTest from '@/components/SocketTest.vue';

export default defineComponent({
  name: 'Websocket',
  components: {
    SocketTest,
  },
});
</script>
