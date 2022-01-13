<template>
  <div>
    <span>{{ message.text }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['message'],
});
</script>
