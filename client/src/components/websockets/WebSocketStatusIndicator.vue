<template>
  <div>
    <span>{{ statusIcon }}</span>
    <span>{{ statusText }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { StoreKey } from '@/symbols';

export default defineComponent({
  setup() {
    const store = useStore(StoreKey);
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
    const statusText = ref(CONNECTING_SYMBOL);

    return {
      statusIcon,
      statusText,
    };
  },
});
</script>
