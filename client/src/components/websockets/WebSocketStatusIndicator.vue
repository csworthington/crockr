<template>
  <div>
    <span>{{ statusIcon }}</span>&nbsp;<span>{{ statusText }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, onMounted, onUnmounted, ref, watch,
} from 'vue';
import { useStore } from 'vuex';
import { StoreKey } from '@/symbols';

interface Status {
  icon: string;
  text: string;
}

export default defineComponent({
  setup() {
    const store = useStore(StoreKey);

    const CONNECTED: Status = {
      icon: '✔️',
      text: 'Connected',
    };

    const DISCONNECTED: Status = {
      icon: 'X',
      text: 'Disconnected',
    };

    const CONNECTING: Status = {
      icon: '',
      text: 'Connecting...',
    };

    const ERROR: Status = {
      icon: '!',
      text: 'Error',
    };

    const statusIcon = ref(DISCONNECTED.icon);
    const statusText = ref(DISCONNECTED.text);

    const setStatus = (status: Status) => {
      statusIcon.value = status.icon;
      statusText.value = status.text;
    };

    const initStatus = () => {
      if (store.state.socket.isCreated) {
        store.state.socket.isConnected ? setStatus(CONNECTED) : setStatus(CONNECTING);
      } else {
        setStatus(DISCONNECTED);
      }
    };

    const unsubscribe = store.subscribe((mutation, state) => {
      if (mutation.type === 'socket/SOCKET_ONCREATED') {
        setStatus(CONNECTING);
      } else if (mutation.type === 'socket/SOCKET_ONOPEN') {
        setStatus(CONNECTED);
      } else if (mutation.type === 'socket/SOCKET_ONCLOSE') {
        setStatus(DISCONNECTED);
      } else if (mutation.type === 'socket/SOCKET_ONERROR') {
        setStatus(ERROR);
      }
    });

    // On component mount, initialize the status indicator
    onMounted(() => {
      initStatus();
    });

    // On component unmount, unsubscribe this component from the store
    onUnmounted(() => {
      unsubscribe();
    });

    return {
      statusIcon,
      statusText,
    };
  },
});
</script>
