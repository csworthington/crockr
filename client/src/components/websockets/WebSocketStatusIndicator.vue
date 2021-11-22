<template>
  <div>
    <span>{{ statusIcon }}</span>
    <span>{{ statusText }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
    const store = useStore();
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
