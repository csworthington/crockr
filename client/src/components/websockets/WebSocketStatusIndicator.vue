<template>
  <div>
    <span>{{ statusIcon }}</span>
    <span>{{ statusText }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, onMounted, ref, watch,
} from 'vue';
import { useStore } from 'vuex';
import { StoreKey } from '@/symbols';
import { useGlobalWebSocket } from '@/plugins/websocket/useGlobalWebSocket';

export default defineComponent({
  setup() {
    const store = useStore(StoreKey);
    const socket = useGlobalWebSocket();

    socket.addEventListener('connected', (evt) => {
      console.log('event fron within status indicator');
    });

    // UTF-8 Checkmark character. (✔️) Placeholder until better character can be found
    const CONNECTED_SYMBOL = '✔️';
    const DISCONNECTED_SYMBOL = 'X';
    const CONNECTING_SYMBOL = '';
    const ERROR_SYMBOL = '!';

    const CONNECTED_TEXT = 'Connected';
    const DISCONNECTED_TEXT = 'Disconnected';
    const CONNECTING_TEXT = 'Connecting...';
    const ERROR_TEXT = 'Error';

    const statusIcon = ref(DISCONNECTED_SYMBOL);
    const statusText = ref(DISCONNECTED_TEXT);

    socket.addEventListener('open', (evt: Event) => {
      statusIcon.value = CONNECTED_SYMBOL;
      statusText.value = CONNECTED_TEXT;
    });

    socket.addEventListener('close', (evt: CloseEvent) => {
      statusIcon.value = DISCONNECTED_SYMBOL;
      statusText.value = DISCONNECTED_TEXT;
    });

    return {
      socket,
      statusIcon,
      statusText,
    };
  },
});
</script>
